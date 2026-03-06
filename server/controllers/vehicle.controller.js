const supabase = require('../config/supabaseClient');
const { writeAudit } = require('./sysadmin.controller');

// ─── Supabase Storage helper ───────────────────────────────────────────────────
const BUCKET = 'fleet-documents';

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets || buckets.find(b => b.name === BUCKET)) return;
    await supabase.storage.createBucket(BUCKET, { public: true });
}

async function uploadToStorage(remotePath, buffer, mimetype) {
    await ensureBucket();
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(remotePath, buffer, { contentType: mimetype, upsert: true });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
    return data.publicUrl;
}

// GET all vehicles
exports.getAllVehicles = async (req, res) => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*, insurance_policies(provider, policy_number, expiry_date)')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// GET single vehicle
exports.getVehicleById = async (req, res) => {
    const { vehicleId } = req.params;
    const { data, error } = await supabase
        .from('vehicles')
        .select('*, insurance_policies(provider, policy_number, expiry_date)')
        .eq('id', vehicleId)
        .single();

    if (error) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json(data);
};

// POST add vehicle — accepts multipart/form-data with optional rc_document + insurance_document files
exports.addVehicle = async (req, res) => {
    try {
        // ── Diagnostic: log what the client actually sent ──────────────
        console.log('[addVehicle] req.body:', JSON.stringify({
            make:                req.body.make,
            model:               req.body.model,
            year:                req.body.year,
            vin:                 req.body.vin,
            vehicle_type:        req.body.vehicle_type,
            functional_category: req.body.functional_category,
            registration_number: req.body.registration_number
        }));

        const {
            make, model, year, vin, registration_number, engine_number,
            insurance_provider, insurance_expiry, insurance_start_date, policy_number,
            vehicle_type, functional_category,
            type, category
        } = req.body;

        if (!make || !model || !year || !vin) {
            return res.status(400).json({ error: 'Make, model, year, and VIN are required.' });
        }

        // ── Input validation & normalization ───────────────────────────
        const parsedYear = parseInt(year, 10);
        const thisYear   = new Date().getFullYear();
        if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > thisYear + 1) {
            return res.status(400).json({ error: `Registration year must be a valid year between 1900 and ${thisYear + 1}.` });
        }
        const normalizedVIN    = vin.toString().trim().toUpperCase();
        const normalizedReg    = registration_number ? registration_number.toString().trim().toUpperCase() : null;
        const normalizedEngine = engine_number ? engine_number.toString().trim().toUpperCase() : null;
        const rcExpiry         = req.body.rc_expiry || null;

        // ── Upload RC document if provided ─────────────────────────────
        let rc_document_url = null;
        const rcFile = req.files?.rc_document?.[0];
        if (rcFile) {
            const ext = rcFile.originalname.split('.').pop().toLowerCase();
            rc_document_url = await uploadToStorage(
                `rc/${Date.now()}_${normalizedVIN.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`,
                rcFile.buffer,
                rcFile.mimetype
            );
        }

        // Accept both new and legacy field names, but enforce explicit selection.
        const normalizedVehicleType = (vehicle_type ?? type ?? '').toString().trim();
        const normalizedFunctionalCategory = (functional_category ?? category ?? '').toString().trim();

        // ── Detailed field log so we can confirm what was received ─────────────
        console.log('[addVehicle] parsed fields → vehicle_type:', JSON.stringify(normalizedVehicleType),
            '| functional_category:', JSON.stringify(normalizedFunctionalCategory));

        if (!normalizedVehicleType) {
            return res.status(400).json({ error: 'Vehicle Type is required and must be explicitly selected.' });
        }
        if (!normalizedFunctionalCategory) {
            return res.status(400).json({ error: 'Functional Category is required and must be explicitly selected.' });
        }

        const vehicleInsertWithCategories = {
            make:                make.toString().trim(),
            model:               model.toString().trim(),
            year:                parsedYear,
            vin:                 normalizedVIN,
            registration_number: normalizedReg,
            engine_number:       normalizedEngine,
            rc_expiry:           rcExpiry,
            status:              'active',
            rc_document_url,
            vehicle_type:        normalizedVehicleType,
            functional_category: normalizedFunctionalCategory
        };

        // ── Log the exact payload going to Supabase ───────────────────────────
        console.log('[addVehicle] INSERT payload:', JSON.stringify({
            vehicle_type: vehicleInsertWithCategories.vehicle_type,
            functional_category: vehicleInsertWithCategories.functional_category,
            make: vehicleInsertWithCategories.make,
            model: vehicleInsertWithCategories.model
        }));

        const insertAttempt = await supabase
            .from('vehicles')
            .insert([vehicleInsertWithCategories])
            .select()
            .single();

        const vehicle = insertAttempt.data;
        const vErr = insertAttempt.error;

        // ── Log what Supabase actually stored ─────────────────────────────────
        if (vehicle) {
            console.log('[addVehicle] Supabase returned → vehicle_type:', JSON.stringify(vehicle.vehicle_type),
                '| functional_category:', JSON.stringify(vehicle.functional_category));
        }

        if (vErr) {
            if (vErr.code === '23505') return res.status(409).json({ error: 'A vehicle with this VIN or Registration Number already exists.' });
            if (/vehicle_type|functional_category/i.test(vErr.message || '')) {
                return res.status(500).json({
                    error: 'Database schema is outdated. Please run latest schema migration for vehicle_type and functional_category.'
                });
            }
            return res.status(500).json({ error: vErr.message });
        }

        // ── Upload insurance document if provided ───────────────────────
        let insurance_document_url = null;
        const insFile = req.files?.insurance_document?.[0];
        if (insFile) {
            const ext = insFile.originalname.split('.').pop().toLowerCase();
            insurance_document_url = await uploadToStorage(
                `insurance/${Date.now()}_${vehicle.id}.${ext}`,
                insFile.buffer,
                insFile.mimetype
            );
        }

        // ── Create insurance policy if provider + expiry supplied ───────
        let insuranceWarning = null;
        if (insurance_provider && insurance_expiry) {
            // policy_number is NOT NULL in schema — auto-generate if not supplied by admin
            const resolvedPolicyNo = (policy_number || '').trim() || `TRU-${vehicle.id.slice(-8).toUpperCase()}`;
            const { error: insErr } = await supabase.from('insurance_policies').insert([{
                vehicle_id:    vehicle.id,
                provider:      insurance_provider,
                policy_number: resolvedPolicyNo,
                start_date:    insurance_start_date || null,
                expiry_date:   insurance_expiry,
                document_url:  insurance_document_url
            }]);
            if (insErr) {
                insuranceWarning = `Vehicle registered, but insurance policy could not be saved: ${insErr.message}`;
                console.error('[addVehicle] insurance insert failed:', insErr.message);
            }
        }

        res.status(201).json({
            message: 'Vehicle registered successfully.',
            vehicle,
            ...(insuranceWarning ? { warning: insuranceWarning } : {})
        });

        // Audit after successful response
        writeAudit({
            type:        'VEHICLE_ADDED',
            severity:    'INFO',
            actorId:     req.user?.id,
            actorName:   req.user?.full_name || req.user?.email,
            actorRole:   req.user?.role,
            entityType:  'vehicle',
            entityId:    vehicle.id,
            entityLabel: `${make} ${model} (${registration_number || vin})`,
            details:     {
                make,
                model,
                year,
                vin,
                registration_number,
                vehicle_type: normalizedVehicleType,
                functional_category: normalizedFunctionalCategory,
                had_insurance: !!(insurance_provider && insurance_expiry)
            }
        });
    } catch (err) {
        console.error('[addVehicle]', err.message);
        res.status(500).json({ error: err.message });
    }
};

// PUT update vehicle status (block/unblock/maintenance)
exports.updateVehicleStatus = async (req, res) => {
    const { vehicleId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['active', 'blocked', 'maintenance'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const { data, error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });

    writeAudit({
        type:        'VEHICLE_STATUS_CHANGED',
        severity:    status === 'blocked' ? 'WARNING' : 'INFO',
        actorId:     req.user?.id,
        actorName:   req.user?.full_name || req.user?.email,
        actorRole:   req.user?.role,
        entityType:  'vehicle',
        entityId:    vehicleId,
        entityLabel: `${data[0].make} ${data[0].model} (${data[0].registration_number || vehicleId.slice(-6)})`,
        details:     { new_status: status }
    });

    res.json({ message: `Vehicle status updated to ${status}.`, vehicle: data[0] });
};

// PUT update vehicle details
exports.updateVehicle = async (req, res) => {
    const { vehicleId } = req.params;
    const raw = req.body || {};

    // ── Strict field whitelist — only these columns may be updated ──────
    const ALLOWED = [
        'make', 'model', 'year', 'registration_number', 'engine_number',
        'vehicle_type', 'functional_category', 'fuel_level', 'current_location',
        'rc_expiry', 'rc_document_url', 'status'
    ];
    const safeUpdates = {};
    for (const key of ALLOWED) {
        if (key in raw) safeUpdates[key] = raw[key];
    }

    // Accept legacy aliases
    if (!safeUpdates.vehicle_type && typeof raw.type === 'string') {
        safeUpdates.vehicle_type = raw.type;
    }
    if (!safeUpdates.functional_category && typeof raw.category === 'string') {
        safeUpdates.functional_category = raw.category;
    }

    // ── Validation & normalization ──────────────────────────────────────
    if (typeof safeUpdates.vehicle_type === 'string') {
        safeUpdates.vehicle_type = safeUpdates.vehicle_type.trim();
        if (!safeUpdates.vehicle_type) {
            return res.status(400).json({ error: 'vehicle_type cannot be empty.' });
        }
    }
    if (typeof safeUpdates.functional_category === 'string') {
        safeUpdates.functional_category = safeUpdates.functional_category.trim();
        if (!safeUpdates.functional_category) {
            return res.status(400).json({ error: 'functional_category cannot be empty.' });
        }
    }
    if ('year' in safeUpdates) {
        const yr  = parseInt(safeUpdates.year, 10);
        const now = new Date().getFullYear();
        if (isNaN(yr) || yr < 1900 || yr > now + 1) {
            return res.status(400).json({ error: `Registration year must be between 1900 and ${now + 1}.` });
        }
        safeUpdates.year = yr;
    }
    if (typeof safeUpdates.make === 'string') safeUpdates.make = safeUpdates.make.trim();
    if (typeof safeUpdates.model === 'string') safeUpdates.model = safeUpdates.model.trim();
    if (typeof safeUpdates.registration_number === 'string') {
        safeUpdates.registration_number = safeUpdates.registration_number.trim().toUpperCase() || null;
    }
    if (typeof safeUpdates.engine_number === 'string') {
        safeUpdates.engine_number = safeUpdates.engine_number.trim().toUpperCase() || null;
    }
    if (safeUpdates.status) {
        const allowed = ['active', 'blocked', 'maintenance'];
        if (!allowed.includes(safeUpdates.status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
        }
    }

    if (Object.keys(safeUpdates).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const { data, error } = await supabase
        .from('vehicles')
        .update(safeUpdates)
        .eq('id', vehicleId)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });

    res.json({ message: 'Vehicle updated successfully.', vehicle: data[0] });
};

// DELETE vehicle — requires a decommission reason for audit trail
exports.deleteVehicle = async (req, res) => {
    const { vehicleId } = req.params;

    // body.reason is primary; query param ?reason=X is fallback for edge cases
    const rawBody = req.body && typeof req.body === 'object' ? req.body : {};
    const reason  = (rawBody.reason || req.query.reason || '').toString().trim();
    const notes   = (rawBody.notes  || req.query.notes  || '').toString().trim();

    if (!reason) {
        return res.status(400).json({ error: 'A decommission reason is required. Please select one from the form.' });
    }

    // Fetch vehicle info before deletion for the audit record
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('make, model, registration_number, vin, status')
        .eq('id', vehicleId)
        .single();

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (error) return res.status(500).json({ error: error.message });

    writeAudit({
        type:        'VEHICLE_DECOMMISSIONED',
        severity:    'CRITICAL',
        actorId:     req.user?.id,
        actorName:   req.user?.full_name || req.user?.email,
        actorRole:   req.user?.role,
        entityType:  'vehicle',
        entityId:    vehicleId,
        entityLabel: `${vehicle.make} ${vehicle.model} (${vehicle.registration_number || vehicle.vin})`,
        details:     {
            make:               vehicle.make,
            model:              vehicle.model,
            registration_number:vehicle.registration_number,
            vin:                vehicle.vin,
            last_status:        vehicle.status,
            decommission_reason:reason,
            notes:              notes || null
        }
    });

    res.json({
        message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.registration_number || vehicle.vin}) has been retired from the fleet registry.`,
        reason,
        audited: true
    });
};
