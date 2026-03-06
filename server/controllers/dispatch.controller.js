const supabase = require('../config/supabaseClient');

// Helper to generate ticket numbers
function generateTicketNumber() {
    return 'REQ-' + Math.floor(1000 + Math.random() * 9000);
}

// ── Smart Trip Classification Engine ─────────────────────────────────────────
/**
 * Analyses trip params and returns intelligence flags:
 * - trip_classification: 'short' | 'medium' | 'long' | 'ultra-long'
 * - is_long_trip:        true when distance > 200 km or est. travel time > 4 h
 * - vip_required:        true when priority = 'vip', pax count > 10, or notes mention VIP keywords
 * - recommended_vehicle_type / recommended_category: best vehicle match hint
 * - score_hint:          object for tie-breaking vehicle selection
 */
function classifyTrip({ distance_km, priority, passenger_count, cargo_type, notes }) {
    const dist = parseFloat(distance_km) || 0;
    const pax  = parseInt(passenger_count, 10) || 0;
    const noteL = (notes || '').toLowerCase();
    const cargoL = (cargo_type || '').toLowerCase();

    // Distance classification
    let trip_classification;
    if      (dist < 50)  trip_classification = 'short';
    else if (dist < 200) trip_classification = 'medium';
    else if (dist < 500) trip_classification = 'long';
    else                 trip_classification = 'ultra-long';

    // Long-trip flag: >200 km OR travel time exceeds 4 h at avg 60 km/h
    const is_long_trip = dist > 200 || (dist > 0 && dist / 60 > 4);

    // VIP requirement
    const vip_required =
        priority === 'vip' ||
        pax > 10 ||
        /\bvip\b|executive|ceo|chairm|president|director|delegate/i.test(noteL);

    // Cargo hazard / heavy
    const heavyCargo = /hazard|heavy|bulk|oversized|dangerous|chemical|flammable/i.test(cargoL + ' ' + noteL);

    // Recommended vehicle type & functional category
    let recommended_vehicle_type, recommended_category;
    if (vip_required) {
        recommended_vehicle_type = 'Car';
        recommended_category     = 'VIP Transport';
    } else if (heavyCargo || (cargoL && cargoL !== 'passengers' && cargoL !== 'general')) {
        recommended_vehicle_type = is_long_trip ? 'Truck' : 'Van';
        recommended_category     = 'Cargo';
    } else if (pax > 6) {
        recommended_vehicle_type = 'Bus';
        recommended_category     = 'Passenger';
    } else {
        recommended_vehicle_type = is_long_trip ? 'SUV' : 'Car';
        recommended_category     = 'Standard';
    }

    return {
        trip_classification,
        is_long_trip,
        vip_required,
        recommended_vehicle_type,
        recommended_category
    };
}

/**
 * Score a vehicle for a given classification result (higher = better match).
 */
function scoreVehicle(vehicle, { recommended_vehicle_type, recommended_category }) {
    let score = 0;
    if (vehicle.vehicle_type          === recommended_vehicle_type) score += 30;
    if (vehicle.functional_category   === recommended_category)     score += 25;
    return score;
}

// GET dispatch stats
exports.getDispatchStats = async (req, res) => {
    const [pendingRes, activeRes, criticalRes] = await Promise.all([
        supabase.from('dispatch_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('dispatch_requests').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('dispatch_requests').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('priority', 'high')
    ]);

    res.json({
        pendingRequests: pendingRes.count || 0,
        activeTrips:     activeRes.count  || 0,
        criticalDelays:  criticalRes.count || 0
    });
};

// GET pending dispatch requests
exports.getPendingRequests = async (req, res) => {
    const { data, error } = await supabase
        .from('dispatch_requests')
        .select('*, driver:users(full_name, email), vehicle:vehicles(make, model, registration_number, vin)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// GET active trips
exports.getActiveTrips = async (req, res) => {
    const { data, error } = await supabase
        .from('dispatch_requests')
        .select('*, driver:users(full_name, email), vehicle:vehicles(make, model, registration_number, vin)')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// GET completed/history
exports.getHistory = async (req, res) => {
    const { data, error } = await supabase
        .from('dispatch_requests')
        .select('*, driver:users(full_name, email), vehicle:vehicles(make, model, registration_number, vin)')
        .in('status', ['completed', 'rejected'])
        .order('updated_at', { ascending: false })
        .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// POST create dispatch request
exports.createRequest = async (req, res) => {
    const { origin, destination, cargo_type, cargo_weight, priority, driver_id, vehicle_id } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required.' });
    }

    const ticket_number = generateTicketNumber();

    const { data, error } = await supabase
        .from('dispatch_requests')
        .insert([{
            ticket_number,
            origin,
            destination,
            cargo_type,
            cargo_weight,
            priority: priority || 'standard',
            status: 'pending',
            driver_id: driver_id || null,
            vehicle_id: vehicle_id || null
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Dispatch request created.', request: data[0] });
};

// PUT approve dispatch request
exports.approveRequest = async (req, res) => {
    const { requestId } = req.params;
    const { driver_id, vehicle_id } = req.body;

    const updates = { status: 'active', updated_at: new Date().toISOString() };
    if (driver_id)  updates.driver_id  = driver_id;
    if (vehicle_id) updates.vehicle_id = vehicle_id;

    const { data, error } = await supabase
        .from('dispatch_requests')
        .update(updates)
        .eq('id', requestId)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Request not found.' });

    // Mark the assigned driver as on-trip and link the assigned vehicle
    const assignedDriverId = data[0].driver_id;
    const assignedVehicleId = data[0].vehicle_id || vehicle_id || null;
    if (assignedDriverId) {
        const { error: dpErr } = await supabase
            .from('driver_profiles')
            .upsert([{ user_id: assignedDriverId, status: 'on-trip', safety_score: 100, assigned_vehicle_id: assignedVehicleId }], { onConflict: 'user_id' });
        if (dpErr) console.error('[approveRequest] driver_profiles upsert error:', dpErr.message);
        else console.log(`[approveRequest] driver ${assignedDriverId} status → on-trip, vehicle → ${assignedVehicleId}`);
    }
    // Mark the vehicle as on-trip so it's visibly unavailable fleet-wide
    if (assignedVehicleId) {
        const { error: vErr } = await supabase
            .from('vehicles')
            .update({ status: 'on-trip' })
            .eq('id', assignedVehicleId);
        if (vErr) console.error('[approveRequest] vehicle status update error:', vErr.message);
        else console.log(`[approveRequest] vehicle ${assignedVehicleId} status → on-trip`);
    }

    res.json({ message: 'Dispatch approved and trip is now active.', request: data[0] });
};

// DELETE / reject dispatch request
exports.rejectRequest = async (req, res) => {
    const { requestId } = req.params;

    const { data, error } = await supabase
        .from('dispatch_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Request not found.' });

    // Free the driver and unlink vehicle
    const rejectedDriverId = data[0].driver_id;
    const rejectedVehicleId = data[0].vehicle_id;
    if (rejectedDriverId) {
        const { error: dpErr } = await supabase
            .from('driver_profiles')
            .upsert([{ user_id: rejectedDriverId, status: 'available', safety_score: 100, assigned_vehicle_id: null }], { onConflict: 'user_id' });
        if (dpErr) console.error('[rejectRequest] driver_profiles upsert error:', dpErr.message);
    }
    // Restore vehicle to active so it's available for future trips
    if (rejectedVehicleId) {
        const { error: vErr } = await supabase
            .from('vehicles')
            .update({ status: 'active' })
            .eq('id', rejectedVehicleId);
        if (vErr) console.error('[rejectRequest] vehicle status restore error:', vErr.message);
        else console.log(`[rejectRequest] vehicle ${rejectedVehicleId} status → active`);
    }

    res.json({ message: 'Dispatch request rejected.' });
};

// POST auto-assign best vehicle + driver, then create dispatch request
// Logic: classify trip → score vehicles → pick best driver → create & go active
exports.autoAssignRequest = async (req, res) => {
    const {
        origin, destination, priority,
        cargo_type, cargo_weight,
        vehicle_type, functional_category,
        requested_date, notes, passenger_count,
        distance_km
    } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required.' });
    }

    try {
        // ── 1. Classify the trip ──────────────────────────────────────────
        const classification = classifyTrip({ distance_km, priority, passenger_count, cargo_type, notes });
        const {
            trip_classification,
            is_long_trip,
            vip_required,
            recommended_vehicle_type,
            recommended_category
        } = classification;

        // Effective type/category: use smart recommendation when user hasn't picked one
        const effectiveType      = vehicle_type         || recommended_vehicle_type;
        const effectiveCategory  = functional_category  || recommended_category;

        // ── 2. Find best matching active vehicle ──────────────────────────
        const { data: allActive } = await supabase
            .from('vehicles')
            .select('id, make, model, registration_number, vin, vehicle_type, functional_category, status, fuel_level')
            .eq('status', 'active')
            .limit(100);

        // Exclude vehicles already on an active trip
        const { data: occupiedLinks } = await supabase
            .from('dispatch_requests')
            .select('vehicle_id')
            .eq('status', 'active');
        const occupiedVehicleIds = new Set((occupiedLinks || []).map(r => r.vehicle_id).filter(Boolean));

        const freeVehicles = (allActive || []).filter(v => !occupiedVehicleIds.has(v.id));

        // Score each free vehicle; prefer exact user-selected type/category, then smart recommendation
        const scoredVehicles = freeVehicles.map(v => {
            let s = scoreVehicle(v, { recommended_vehicle_type, recommended_category });
            // Bonus if it exactly matches what the user manually requested
            if (vehicle_type        && v.vehicle_type         === vehicle_type)        s += 15;
            if (functional_category && v.functional_category  === functional_category) s += 10;
            // Fuel level bonus
            if (v.fuel_level && v.fuel_level > 50) s += 5;
            return { ...v, _score: s };
        });

        scoredVehicles.sort((a, b) => b._score - a._score);
        const bestVehicle = scoredVehicles[0] || null;

        // ── 3. Find best available driver ─────────────────────────────────
        // Query drivers whose status is 'available' OR who have no currently active trip
        // (safety fallback: corrects stale status values in driver_profiles)
        const { data: availableDrivers } = await supabase
            .from('driver_profiles')
            .select('user_id, status, safety_score, assigned_vehicle_id, users!user_id(full_name, email)')
            .in('status', ['available', 'on-trip'])   // fetch both; we'll filter by active-trip cross-check below
            .order('safety_score', { ascending: false })
            .limit(50);

        const { data: occupiedDriverLinks } = await supabase
            .from('dispatch_requests')
            .select('driver_id')
            .eq('status', 'active');
        const occupiedDriverIds = new Set((occupiedDriverLinks || []).map(r => r.driver_id).filter(Boolean));

        // A driver is truly free if they have no active trip (regardless of status column)
        const freeDrivers = (availableDrivers || []).filter(d => !occupiedDriverIds.has(d.user_id));

        // Prefer driver assigned to chosen vehicle first, then highest safety score
        let bestDriver = null;
        if (bestVehicle) {
            bestDriver =
                freeDrivers.find(d => d.assigned_vehicle_id === bestVehicle.id) ||
                freeDrivers[0] || null;
        } else {
            bestDriver = freeDrivers[0] || null;
        }

        // ── 4. Create dispatch request ────────────────────────────────────
        console.log(`[autoAssign] freeVehicles:${freeVehicles.length} | freeDrivers:${freeDrivers.length} | bestVehicle:${bestVehicle?.id||'none'} | bestDriver:${bestDriver?.user_id||'none'}`);
        const ticket_number  = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
        const tripIsActive   = !!(bestVehicle && bestDriver);

        const insertPayload = {
            ticket_number,
            origin,
            destination,
            cargo_type:           cargo_type      || null,
            cargo_weight:         cargo_weight     || null,
            priority:             priority         || 'standard',
            status:               tripIsActive ? 'active' : 'pending',
            vehicle_id:           bestVehicle  ? bestVehicle.id    : null,
            driver_id:            bestDriver   ? bestDriver.user_id : null,
            notes:                notes            || null,
            passenger_count:      passenger_count  ? parseInt(passenger_count, 10) : null,
            requested_date:       requested_date   || null,
            // ── Smart Intelligence fields ──
            distance_km:          distance_km      ? parseFloat(distance_km) : null,
            trip_classification,
            is_long_trip,
            vip_required
        };

        const { data: created, error: createErr } = await supabase
            .from('dispatch_requests')
            .insert([insertPayload])
            .select()
            .single();

        if (createErr) return res.status(500).json({ error: createErr.message });

        // ── 5. Mark driver as on-trip and link the assigned vehicle ────────────
        if (tripIsActive && bestDriver) {
            const { error: dpErr } = await supabase
                .from('driver_profiles')
                .upsert(
                    [{ user_id: bestDriver.user_id, status: 'on-trip', safety_score: bestDriver.safety_score ?? 100, assigned_vehicle_id: bestVehicle.id }],
                    { onConflict: 'user_id' }
                );
            if (dpErr) console.error('[autoAssign] driver_profiles upsert error:', dpErr.message);
            else console.log(`[autoAssign] driver ${bestDriver.user_id} status → on-trip, vehicle → ${bestVehicle.id}`);
            // Mark the vehicle as on-trip so it's visibly unavailable fleet-wide
            const { error: vErr } = await supabase
                .from('vehicles')
                .update({ status: 'on-trip' })
                .eq('id', bestVehicle.id);
            if (vErr) console.error('[autoAssign] vehicle status update error:', vErr.message);
            else console.log(`[autoAssign] vehicle ${bestVehicle.id} status → on-trip`);
        }

        return res.status(201).json({
            message: tripIsActive
                ? 'Vehicle and driver auto-assigned. Trip is now active.'
                : 'Request created as pending — no available vehicle/driver found at this time.',
            request:        created,
            assigned:       { vehicle: bestVehicle || null, driver: bestDriver || null },
            autoAssigned:   tripIsActive,
            intelligence:   { trip_classification, is_long_trip, vip_required, recommended_vehicle_type, recommended_category }
        });

    } catch (err) {
        console.error('[autoAssignRequest]', err.message);
        res.status(500).json({ error: err.message });
    }
};

// GET auto-assign preview — returns best vehicle + driver WITHOUT creating the request
// Also performs trip classification so UI can show intelligence badges
exports.previewAutoAssign = async (req, res) => {
    const {
        functional_category, vehicle_type,
        distance_km, priority, passenger_count, cargo_type, notes
    } = req.query;

    try {
        // ── Classification ────────────────────────────────────────────────
        const classification = classifyTrip({ distance_km, priority, passenger_count, cargo_type, notes });
        const { recommended_vehicle_type, recommended_category } = classification;

        // ── Best vehicle ──────────────────────────────────────────────────
        const { data: allActive } = await supabase
            .from('vehicles')
            .select('id, make, model, registration_number, vin, vehicle_type, functional_category, status, fuel_level')
            .eq('status', 'active')
            .limit(100);

        const { data: occupiedLinks } = await supabase
            .from('dispatch_requests').select('vehicle_id').eq('status', 'active');
        const occupiedVehicleIds = new Set((occupiedLinks || []).map(r => r.vehicle_id).filter(Boolean));

        const freeVehicles = (allActive || []).filter(v => !occupiedVehicleIds.has(v.id));
        const scoredVehicles = freeVehicles.map(v => {
            let s = scoreVehicle(v, { recommended_vehicle_type, recommended_category });
            if (vehicle_type        && v.vehicle_type        === vehicle_type)        s += 15;
            if (functional_category && v.functional_category === functional_category) s += 10;
            if (v.fuel_level && v.fuel_level > 50) s += 5;
            return { ...v, _score: s };
        });
        scoredVehicles.sort((a, b) => b._score - a._score);
        const bestVehicle = scoredVehicles[0] || null;

        // ── Best driver ───────────────────────────────────────────────────
        const { data: availableDrivers } = await supabase
            .from('driver_profiles')
            .select('user_id, status, safety_score, assigned_vehicle_id, users!user_id(full_name, email)')
            .in('status', ['available', 'on-trip'])
            .order('safety_score', { ascending: false })
            .limit(50);
        const { data: occupiedDriverLinks } = await supabase
            .from('dispatch_requests').select('driver_id').eq('status', 'active');
        const occupiedDriverIds = new Set((occupiedDriverLinks || []).map(r => r.driver_id).filter(Boolean));

        const freeDrivers = (availableDrivers || []).filter(d => !occupiedDriverIds.has(d.user_id));
        let bestDriver = null;
        if (bestVehicle) {
            bestDriver = freeDrivers.find(d => d.assigned_vehicle_id === bestVehicle.id) || freeDrivers[0] || null;
        } else {
            bestDriver = freeDrivers[0] || null;
        }

        res.json({
            vehicle:       bestVehicle || null,
            driver:        bestDriver  || null,
            intelligence:  classification
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT complete a trip
exports.completeTrip = async (req, res) => {
    const { requestId } = req.params;

    const { data, error } = await supabase
        .from('dispatch_requests')
        .update({ status: 'completed', progress_pct: 100, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Free the driver and restore the vehicle
    const completedDriverId = data?.[0]?.driver_id;
    const completedVehicleId = data?.[0]?.vehicle_id;
    if (completedDriverId) {
        const { error: dpErr } = await supabase
            .from('driver_profiles')
            .upsert([{ user_id: completedDriverId, status: 'available', safety_score: 100, assigned_vehicle_id: null }], { onConflict: 'user_id' });
        if (dpErr) console.error('[completeTrip] driver_profiles upsert error:', dpErr.message);
        else console.log(`[completeTrip] driver ${completedDriverId} status → available, vehicle unlinked`);
    }
    // Restore vehicle to active — trip is done, asset is back in the pool
    if (completedVehicleId) {
        const { error: vErr } = await supabase
            .from('vehicles')
            .update({ status: 'active' })
            .eq('id', completedVehicleId);
        if (vErr) console.error('[completeTrip] vehicle status restore error:', vErr.message);
        else console.log(`[completeTrip] vehicle ${completedVehicleId} status → active`);
    }

    res.json({ message: 'Trip marked as completed.', request: data[0] });
};

// ══════════════════════════════════════════════════════════════════════════════
// LIVE LOCATION STORE — in-memory, per driver
// Structure: Map<driver_id, { lat, lng, speed, heading, trip_id, vehicle_id,
//                              driver_name, vehicle_reg, origin, destination,
//                              updated_at }>
// ══════════════════════════════════════════════════════════════════════════════
const liveLocations = new Map();

/**
 * POST /api/dispatch/location
 * Body: { driver_id, lat, lng, speed?, heading?, trip_id?, vehicle_id?,
 *         driver_name?, vehicle_reg?, origin?, destination? }
 * Used by Python sim script and future mobile driver app.
 * No auth required — API key checked instead.
 */
exports.updateLocation = (req, res) => {
    const { driver_id, lat, lng, speed, heading, trip_id,
            vehicle_id, driver_name, vehicle_reg, origin, destination } = req.body;

    if (!driver_id || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'driver_id, lat, lng are required.' });
    }

    const payload = {
        driver_id,
        lat:          parseFloat(lat),
        lng:          parseFloat(lng),
        speed:        parseFloat(speed)        || 0,
        heading:      parseFloat(heading)      || 0,
        trip_id:      trip_id      || null,
        vehicle_id:   vehicle_id   || null,
        driver_name:  driver_name  || 'Driver',
        vehicle_reg:  vehicle_reg  || '—',
        origin:       origin       || '—',
        destination:  destination  || '—',
        updated_at:   new Date().toISOString()
    };

    liveLocations.set(driver_id, payload);

    // Broadcast to all connected manager dashboards via Socket.IO
    const io = req.app.get('io');
    if (io) io.emit('location:update', payload);

    res.json({ ok: true });
};

/**
 * GET /api/dispatch/live-locations
 * Returns all drivers with a live location in the last 5 minutes.
 */
exports.getLiveLocations = (req, res) => {
    const fiveMin = 5 * 60 * 1000;
    const now = Date.now();
    const active = [];
    for (const [, loc] of liveLocations) {
        if (now - new Date(loc.updated_at).getTime() < fiveMin) {
            active.push(loc);
        }
    }
    res.json(active);
};
