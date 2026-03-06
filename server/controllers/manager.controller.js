const supabase = require('../config/supabaseClient');

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStr = todayStart.toISOString();

        const [
            tripsTodayRes,
            completedTodayRes,
            pendingRes,
            maintenanceRes
        ] = await Promise.all([
            // Trips that were created or are active today
            supabase
                .from('dispatch_requests')
                .select('*', { count: 'exact', head: true })
                .in('status', ['active', 'completed'])
                .gte('created_at', todayStr),
            // Completed today for on-time rate approximation
            supabase
                .from('dispatch_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed')
                .gte('updated_at', todayStr),
            supabase
                .from('dispatch_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending'),
            supabase
                .from('vehicles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'maintenance')
        ]);

        const tripsToday      = tripsTodayRes.count    || 0;
        const completedToday  = completedTodayRes.count || 0;
        const pendingDispatch = pendingRes.count         || 0;
        const inMaintenance   = maintenanceRes.count     || 0;

        // On-time rate: completedToday / tripsToday * 100 (fallback 100 if none)
        const onTimeRate = tripsToday > 0
            ? Math.round((completedToday / tripsToday) * 100)
            : 100;

        res.json({
            tripsToday,
            onTimeRate,
            pendingDispatch,
            vehiclesInMaintenance: inMaintenance
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
};

// ─── FLEET SUMMARY for donut chart ─────────────────────────────────────────
exports.getFleetSummary = async (req, res) => {
    try {
        const [onRoadRes, idleRes, maintenanceRes] = await Promise.all([
            supabase.from('dispatch_requests').select('vehicle_id').eq('status', 'active'),
            supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'maintenance')
        ]);

        const onRoadIds    = (onRoadRes.data || []).map(r => r.vehicle_id).filter(Boolean);
        const onRoad       = onRoadIds.length;
        const totalActive  = idleRes.count || 0;
        const idle         = Math.max(0, totalActive - onRoad);
        const maintenance  = maintenanceRes.count || 0;

        res.json({ onRoad, idle, maintenance });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch fleet summary.' });
    }
};

// ─── FULL FLEET VIEW with computed trip/driver status ──────────────────────
exports.getManagerFleet = async (req, res) => {
    try {
        const [vehiclesRes, activeTripsRes, driverProfilesRes] = await Promise.all([
            supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
            supabase
                .from('dispatch_requests')
                .select('id, vehicle_id, driver_id, origin, destination, ticket_number, cargo_type, cargo_weight, driver:users!driver_id(full_name)')
                .eq('status', 'active'),
            supabase
                .from('driver_profiles')
                .select('assigned_vehicle_id, user_id, users!user_id(full_name)')
                .not('assigned_vehicle_id', 'is', null)
        ]);

        if (vehiclesRes.error) return res.status(500).json({ error: vehiclesRes.error.message });

        // Build lookup maps
        const activeByVehicle = {};
        (activeTripsRes.data || []).forEach(trip => {
            if (trip.vehicle_id) activeByVehicle[trip.vehicle_id] = trip;
        });

        const driverByVehicle = {};
        (driverProfilesRes.data || []).forEach(dp => {
            if (dp.assigned_vehicle_id) driverByVehicle[dp.assigned_vehicle_id] = dp;
        });

        const result = (vehiclesRes.data || []).map(v => {
            let computed_status = v.status; // 'active', 'maintenance', 'blocked'
            let current_trip    = null;
            let assigned_driver = null;

            if (v.status === 'active' && activeByVehicle[v.id]) {
                computed_status = 'on-road';
                current_trip    = activeByVehicle[v.id];
                assigned_driver = current_trip.driver ? current_trip.driver.full_name : null;
            }

            if (!assigned_driver && driverByVehicle[v.id]) {
                const dp = driverByVehicle[v.id];
                assigned_driver = dp.users ? dp.users.full_name : null;
            }

            return { ...v, computed_status, current_trip, assigned_driver };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch fleet.' });
    }
};

// ─── MAINTENANCE ORDERS ─────────────────────────────────────────────────────
exports.getMaintenanceOrders = async (req, res) => {
    try {
        const { status, order_type } = req.query;

        let query = supabase
            .from('maintenance_orders')
            .select('*, vehicle:vehicles(make, model, registration_number, status)')
            .order('created_at', { ascending: false });

        if (status)     query = query.eq('status', status);
        if (order_type) query = query.eq('order_type', order_type);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch maintenance orders.' });
    }
};

// ─── MAINTENANCE STATS ──────────────────────────────────────────────────────
exports.getMaintenanceStats = async (req, res) => {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [inServiceRes, completedThisMonthRes, costRes] = await Promise.all([
            supabase
                .from('maintenance_orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['scheduled', 'in-service', 'awaiting-parts']),
            supabase
                .from('maintenance_orders')
                .select('actual_cost')
                .eq('status', 'completed')
                .gte('completed_date', monthStart.toISOString()),
            supabase
                .from('maintenance_orders')
                .select('actual_cost, completed_date')
                .eq('status', 'completed')
                .gte('completed_date', monthStart.toISOString())
        ]);

        const inService       = inServiceRes.count || 0;
        const costData        = costRes.data || [];
        const monthCost       = costData.reduce((sum, r) => sum + (r.actual_cost || 0), 0);

        res.json({
            vehiclesInService: inService,
            avgDowntimeDays:   inService > 0 ? '3.2' : '0',   // placeholder until downtime tracking
            monthCost:         monthCost.toFixed(0)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch maintenance stats.' });
    }
};

// ─── MAINTENANCE COST CHART — last 6 months ────────────────────────────────
exports.getMaintenanceCostChart = async (req, res) => {
    try {
        const results = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end  = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = d.toLocaleString('default', { month: 'short' });

            const { data } = await supabase
                .from('maintenance_orders')
                .select('actual_cost')
                .eq('status', 'completed')
                .gte('completed_date', d.toISOString())
                .lt('completed_date', end.toISOString());

            const total = (data || []).reduce((s, r) => s + (r.actual_cost || 0), 0);
            results.push({ month: label, cost: Math.round(total / 1000) }); // in ₹1000s
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cost chart data.' });
    }
};

// ─── CREATE MAINTENANCE ORDER ────────────────────────────────────────────────
exports.createMaintenanceOrder = async (req, res) => {
    try {
        const {
            vehicle_id, title, description, priority,
            order_type, mechanic_name, scheduled_date,
            estimated_cost, eta_parts, odometer_reading
        } = req.body;

        if (!vehicle_id || !title) {
            return res.status(400).json({ error: 'vehicle_id and title are required.' });
        }

        const { data, error } = await supabase
            .from('maintenance_orders')
            .insert([{
                vehicle_id,
                title,
                description:      description || null,
                priority:         priority    || 'medium',
                status:           'scheduled',
                order_type:       order_type  || 'corrective',
                mechanic_name:    mechanic_name    || null,
                scheduled_date:   scheduled_date   || null,
                estimated_cost:   estimated_cost   || null,
                eta_parts:        eta_parts         || null,
                odometer_reading: odometer_reading ? parseFloat(odometer_reading) : null
            }])
            .select('*, vehicle:vehicles(make, model, registration_number)');

        if (error) return res.status(500).json({ error: error.message });

        // If vehicle not already in maintenance, update its status
        await supabase
            .from('vehicles')
            .update({ status: 'maintenance' })
            .eq('id', vehicle_id)
            .eq('status', 'active');

        res.status(201).json({ message: 'Work order created.', order: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create work order.' });
    }
};

// ─── UPDATE KANBAN STATUS ────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status }  = req.body;

        const allowed = ['scheduled', 'in-service', 'awaiting-parts', 'ready', 'completed'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
        }

        const updates = { status, updated_at: new Date().toISOString() };
        if (status === 'completed') {
            updates.completed_date = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('maintenance_orders')
            .update(updates)
            .eq('id', orderId)
            .select('*, vehicle:vehicles(id, make, model, registration_number)');

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ error: 'Order not found.' });

        // If completed, set vehicle back to active
        if (status === 'completed' && data[0].vehicle) {
            await supabase
                .from('vehicles')
                .update({ status: 'active' })
                .eq('id', data[0].vehicle.id);
        }

        res.json({ message: `Order status updated to ${status}.`, order: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status.' });
    }
};

// ─── PROACTIVE MAINTENANCE (vehicles in maintenance + high mileage) ─────────
exports.getProactiveMaintenance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_orders')
            .select('*, vehicle:vehicles(make, model, registration_number)')
            .eq('order_type', 'proactive')
            .in('status', ['scheduled', 'in-service'])
            .order('scheduled_date', { ascending: true })
            .limit(10);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch proactive maintenance.' });
    }
};

// ─── RECENT ACTIVITY FEED ───────────────────────────────────────────────────
exports.getActivityFeed = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('dispatch_requests')
            .select('id, ticket_number, origin, destination, status, updated_at, vehicle:vehicles(registration_number, make), driver:users!driver_id(full_name)')
            .in('status', ['active', 'completed', 'rejected'])
            .order('updated_at', { ascending: false })
            .limit(10);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch activity feed.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── VEHICLE MAINTENANCE & SERVICE TRACKING SYSTEM — Extended Endpoints ────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── MAINTENANCE ALERTS (overdue + upcoming in next 7 days) ────────────────────
exports.getMaintenanceAlerts = async (req, res) => {
    try {
        const today    = new Date().toISOString().split('T')[0];
        const in7days  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        const [overdueOrders, upcomingOrders, complianceExpiring] = await Promise.all([
            // Overdue work orders (scheduled past due)
            supabase
                .from('maintenance_orders')
                .select('id, title, priority, scheduled_date, vehicle:vehicles(registration_number, make, model)')
                .eq('status', 'scheduled')
                .lt('scheduled_date', today)
                .order('scheduled_date', { ascending: true })
                .limit(10),
            // Orders due in next 7 days
            supabase
                .from('maintenance_orders')
                .select('id, title, priority, scheduled_date, vehicle:vehicles(registration_number, make, model)')
                .eq('status', 'scheduled')
                .gte('scheduled_date', today)
                .lte('scheduled_date', in7days)
                .order('scheduled_date', { ascending: true })
                .limit(10),
            // Compliance expiring in 30 days
            supabase
                .from('compliance_records')
                .select('id, record_type, expiry_date, vehicle:vehicles(registration_number, make, model)')
                .lte('expiry_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
                .gte('expiry_date', today)
                .order('expiry_date', { ascending: true })
                .limit(10)
        ]);

        res.json({
            overdue:    overdueOrders.data   || [],
            upcoming:   upcomingOrders.data  || [],
            compliance: complianceExpiring.data || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts.' });
    }
};

// ── SERVICE HISTORY (completed orders, filterable by vehicle) ─────────────────
exports.getServiceHistory = async (req, res) => {
    try {
        const { vehicle_id, limit = 50 } = req.query;

        let query = supabase
            .from('maintenance_orders')
            .select('*, vehicle:vehicles(make, model, registration_number)')
            .eq('status', 'completed')
            .order('completed_date', { ascending: false })
            .limit(parseInt(limit, 10));

        if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch service history.' });
    }
};

// ── PREVENTIVE SCHEDULES ──────────────────────────────────────────────────────
exports.getPreventiveSchedules = async (req, res) => {
    try {
        const { vehicle_id } = req.query;

        let query = supabase
            .from('preventive_schedules')
            .select('*, vehicle:vehicles(make, model, registration_number, mileage_km)')
            .order('next_due_date', { ascending: true });

        if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });

        // Compute status live
        const today = new Date().toISOString().split('T')[0];
        const result = (data || []).map(s => {
            const vehicleKm = s.vehicle?.mileage_km || 0;
            let status = s.status || 'active';

            if (s.next_due_date && s.next_due_date < today) status = 'overdue';
            else if (s.next_due_km && vehicleKm >= s.next_due_km) status = 'overdue';
            else if (s.next_due_date) {
                const diff = (new Date(s.next_due_date) - new Date()) / 86400000;
                if (diff <= 14) status = 'upcoming';
            }

            return { ...s, status };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch preventive schedules.' });
    }
};

exports.createPreventiveSchedule = async (req, res) => {
    try {
        const {
            vehicle_id, service_type, interval_km, interval_days,
            last_service_km, last_service_date, notes
        } = req.body;

        if (!vehicle_id || !service_type) {
            return res.status(400).json({ error: 'vehicle_id and service_type are required.' });
        }

        // Compute next_due values
        const next_due_km   = last_service_km   && interval_km   ? parseFloat(last_service_km)   + parseFloat(interval_km)   : null;
        const next_due_date = last_service_date  && interval_days
            ? new Date(new Date(last_service_date).getTime() + interval_days * 86400000).toISOString().split('T')[0]
            : null;

        const { data, error } = await supabase
            .from('preventive_schedules')
            .insert([{
                vehicle_id,
                service_type,
                interval_km:       interval_km   ? parseFloat(interval_km)   : null,
                interval_days:     interval_days ? parseInt(interval_days, 10) : null,
                last_service_km:   last_service_km  ? parseFloat(last_service_km)  : null,
                last_service_date: last_service_date || null,
                next_due_km,
                next_due_date,
                notes: notes || null,
                status: 'active'
            }])
            .select('*, vehicle:vehicles(make, model, registration_number)');

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Schedule created.', schedule: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create schedule.' });
    }
};

exports.deletePreventiveSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { error } = await supabase.from('preventive_schedules').delete().eq('id', scheduleId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Schedule deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete schedule.' });
    }
};

// ── VEHICLE COMPONENTS ────────────────────────────────────────────────────────
exports.getVehicleComponents = async (req, res) => {
    try {
        const { vehicle_id } = req.params;

        const { data, error } = await supabase
            .from('vehicle_components')
            .select('*')
            .eq('vehicle_id', vehicle_id)
            .order('health_pct', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch components.' });
    }
};

exports.upsertVehicleComponent = async (req, res) => {
    try {
        const { vehicle_id } = req.params;
        const { component_name, health_pct, last_replaced, notes } = req.body;

        if (!component_name) return res.status(400).json({ error: 'component_name is required.' });

        const { data, error } = await supabase
            .from('vehicle_components')
            .upsert([{
                vehicle_id,
                component_name,
                health_pct:    health_pct    != null ? parseInt(health_pct, 10) : 100,
                last_replaced: last_replaced || null,
                notes:         notes         || null,
                updated_at:    new Date().toISOString()
            }], { onConflict: 'vehicle_id,component_name' })
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Component updated.', component: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update component.' });
    }
};

// ── ALL COMPONENTS (fleet overview) ──────────────────────────────────────────
exports.getAllComponents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicle_components')
            .select('*, vehicle:vehicles(make, model, registration_number)')
            .order('health_pct', { ascending: true })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch all components.' });
    }
};

// ── COMPLIANCE RECORDS ────────────────────────────────────────────────────────
exports.getComplianceRecords = async (req, res) => {
    try {
        const { vehicle_id } = req.query;
        const today = new Date().toISOString().split('T')[0];
        const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        let query = supabase
            .from('compliance_records')
            .select('*, vehicle:vehicles(make, model, registration_number)')
            .order('expiry_date', { ascending: true });

        if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });

        // Compute live compliance status
        const result = (data || []).map(r => {
            let comp_status = 'valid';
            if (r.expiry_date < today)  comp_status = 'expired';
            else if (r.expiry_date <= in30) comp_status = 'expiring_soon';
            return { ...r, comp_status };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch compliance records.' });
    }
};

exports.createComplianceRecord = async (req, res) => {
    try {
        const { vehicle_id, record_type, issued_date, expiry_date, authority, document_url, notes } = req.body;

        if (!vehicle_id || !record_type || !expiry_date) {
            return res.status(400).json({ error: 'vehicle_id, record_type, expiry_date are required.' });
        }

        const { data, error } = await supabase
            .from('compliance_records')
            .insert([{ vehicle_id, record_type, issued_date: issued_date || null, expiry_date, authority: authority || null, document_url: document_url || null, notes: notes || null }])
            .select('*, vehicle:vehicles(make, model, registration_number)');

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Compliance record added.', record: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create compliance record.' });
    }
};

exports.deleteComplianceRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { error } = await supabase.from('compliance_records').delete().eq('id', recordId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Record deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete record.' });
    }
};

// ── SERVICE VENDORS ───────────────────────────────────────────────────────────
exports.getVendors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('service_vendors')
            .select('*')
            .eq('is_active', true)
            .order('rating', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vendors.' });
    }
};

exports.createVendor = async (req, res) => {
    try {
        const { name, contact_person, phone, email, address, city, specialization, rating } = req.body;

        if (!name) return res.status(400).json({ error: 'name is required.' });

        const { data, error } = await supabase
            .from('service_vendors')
            .insert([{
                name,
                contact_person: contact_person || null,
                phone:          phone          || null,
                email:          email          || null,
                address:        address        || null,
                city:           city           || null,
                specialization: specialization || 'general',
                rating:         rating         ? parseFloat(rating) : 5.0
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Vendor added.', vendor: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create vendor.' });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        // Soft delete
        const { error } = await supabase
            .from('service_vendors')
            .update({ is_active: false })
            .eq('id', vendorId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Vendor removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete vendor.' });
    }
};

// ── DOWNTIME STATS ────────────────────────────────────────────────────────────
exports.getDowntimeStats = async (req, res) => {
    try {
        // Count vehicles currently in maintenance (= active downtime)
        const [currentDown, completedOrders] = await Promise.all([
            supabase
                .from('vehicles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'maintenance'),
            supabase
                .from('maintenance_orders')
                .select('actual_cost, created_at, completed_date')
                .eq('status', 'completed')
                .not('completed_date', 'is', null)
                .not('created_at', 'is', null)
                .limit(100)
        ]);

        const orders = completedOrders.data || [];
        let totalHours = 0;
        orders.forEach(o => {
            if (o.completed_date && o.created_at) {
                totalHours += (new Date(o.completed_date) - new Date(o.created_at)) / 3600000;
            }
        });

        const avgDowntimeHours = orders.length > 0 ? (totalHours / orders.length).toFixed(1) : 0;

        res.json({
            currentDownCount:   currentDown.count || 0,
            avgDowntimeHours:   parseFloat(avgDowntimeHours),
            avgDowntimeDays:    (parseFloat(avgDowntimeHours) / 24).toFixed(1),
            totalCompletedJobs: orders.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch downtime stats.' });
    }
};

// ── CALENDAR EVENTS (aggregates schedules + compliance + work orders) ─────────
exports.getCalendarEvents = async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        let startDate, endDate;
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [y, m] = month.split('-').map(Number);
            startDate = new Date(y, m - 1, 1).toISOString().split('T')[0];
            endDate   = new Date(y, m + 2, 0).toISOString().split('T')[0]; // 3 months window
        } else {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            endDate   = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().split('T')[0];
        }

        const [schedRes, compRes, woRes] = await Promise.all([
            supabase.from('preventive_schedules')
                .select('id, service_type, next_due_date, next_due_km, vehicle_id, vehicle:vehicles(registration_number, make, model)')
                .gte('next_due_date', startDate)
                .lte('next_due_date', endDate),
            supabase.from('compliance_records')
                .select('id, record_type, expiry_date, vehicle_id, vehicle:vehicles(registration_number, make, model)')
                .gte('expiry_date', startDate)
                .lte('expiry_date', endDate),
            supabase.from('maintenance_orders')
                .select('id, title, scheduled_date, status, priority, order_type, vehicle_id, vehicle:vehicles(registration_number, make, model)')
                .gte('scheduled_date', startDate)
                .lte('scheduled_date', endDate)
                .not('status', 'eq', 'completed')
        ]);

        const events = [];
        const compLabels = { pollution_cert: 'PUC Certificate', fitness_cert: 'Fitness Certificate', national_permit: 'National Permit', state_permit: 'State Permit', road_tax: 'Road Tax', goods_permit: 'Goods Permit' };
        const schedLabels = { oil_change: 'Oil Change', tyre_rotation: 'Tyre Rotation', brake_check: 'Brake Check', engine_service: 'Engine Service', filter_change: 'Filter Change', battery_check: 'Battery Check', ac_service: 'AC Service', general_inspection: 'General Inspection' };

        (schedRes.data || []).forEach(s => {
            events.push({
                date: s.next_due_date,
                type: 'schedule',
                label: schedLabels[s.service_type] || s.service_type,
                vehicle_id: s.vehicle_id,
                vehicle: s.vehicle,
                color: '#2563EB',
                icon: 'fa-calendar-check'
            });
        });
        (compRes.data || []).forEach(r => {
            events.push({
                date: r.expiry_date,
                type: 'compliance',
                label: compLabels[r.record_type] || r.record_type,
                vehicle_id: r.vehicle_id,
                vehicle: r.vehicle,
                color: '#F59E0B',
                icon: 'fa-shield-halved'
            });
        });
        (woRes.data || []).forEach(o => {
            events.push({
                date: o.scheduled_date,
                type: 'work_order',
                label: o.title,
                vehicle_id: o.vehicle_id,
                vehicle: o.vehicle,
                priority: o.priority,
                status: o.status,
                color: o.priority === 'high' ? '#EF4444' : o.priority === 'medium' ? '#F59E0B' : '#10B981',
                icon: 'fa-wrench'
            });
        });

        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch calendar events.' });
    }
};

// ── GET SINGLE ORDER (used by invoice modal to pre-fill fields) ───────────────
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { data, error } = await supabase
            .from('maintenance_orders')
            .select('*, vehicle:vehicles(make, model, registration_number, vin)')
            .eq('id', orderId)
            .maybeSingle();
        if (error) return res.status(500).json({ error: error.message });
        if (!data)  return res.status(404).json({ error: 'Order not found.' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get order.' });
    }
};

// ── SAVE INVOICE DETAILS (manager fills in final cost + invoice number) ───────
exports.saveOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { invoice_number, invoice_total, invoice_notes, actual_cost } = req.body;

        const update = {
            invoice_generated_at: new Date().toISOString(),
            updated_at:           new Date().toISOString()
        };
        if (invoice_number != null) update.invoice_number = invoice_number;
        if (invoice_total  != null) update.invoice_total  = parseFloat(invoice_total);
        if (invoice_notes  != null) update.invoice_notes  = invoice_notes;
        if (actual_cost    != null) update.actual_cost    = parseFloat(actual_cost);

        const { data, error } = await supabase
            .from('maintenance_orders')
            .update(update)
            .eq('id', orderId)
            .select('*, vehicle:vehicles(make, model, registration_number, vin)');

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Invoice saved.', order: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save invoice.' });
    }
};
