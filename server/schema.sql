-- Create user roles ENUM type for data integrity (idempotent)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('admin', 'manager', 'driver');
        END IF;
    END
    $$;

    -- Main Users Table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        company_name TEXT,
        role user_role NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT,
        avatar_url TEXT
    );
    -- Security is enforced by the Express API layer (JWT + role middleware).
    -- Disable RLS so the backend service key can read/write freely.
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;

    -- Vehicles Table
    CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INT NOT NULL,
        vin TEXT UNIQUE NOT NULL,
        registration_number TEXT UNIQUE,
        engine_number TEXT,
        status TEXT DEFAULT 'active', -- 'active', 'maintenance', 'blocked'
        rc_document_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

    -- Insurance Policies Table
    CREATE TABLE IF NOT EXISTS insurance_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        start_date DATE,
        expiry_date DATE NOT NULL,
        document_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE insurance_policies DISABLE ROW LEVEL SECURITY;

    -- Driver Profiles Table (extends users with role='driver')
    CREATE TABLE IF NOT EXISTS driver_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        phone TEXT,
        license_number TEXT,
        license_type TEXT DEFAULT 'HGMV',
        license_expiry DATE,
        safety_score INTEGER DEFAULT 100,
        miles_this_month NUMERIC DEFAULT 0,
        total_incidents INTEGER DEFAULT 0,
        years_experience INTEGER DEFAULT 0,
        assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'available', -- 'available', 'on-trip', 'off-duty'
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE driver_profiles DISABLE ROW LEVEL SECURITY;

    -- Dispatch Requests Table
    CREATE TABLE IF NOT EXISTS dispatch_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number TEXT UNIQUE NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        cargo_type TEXT,
        cargo_weight TEXT,
        priority TEXT DEFAULT 'standard', -- 'high', 'standard'
        status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'rejected'
        driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
        progress_pct INTEGER DEFAULT 0,
        eta TEXT,
        speed NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE dispatch_requests DISABLE ROW LEVEL SECURITY;

    -- Note: For a Fleet Admin to be created on first signup, you can manually create one
    -- or have a special "super-admin" role. As requested, the first 'admin' is auto-approved.

    -- SEQUENCE for auto-generating ticket numbers
    CREATE SEQUENCE IF NOT EXISTS dispatch_ticket_seq START 1000;

    -- ── Maintenance Orders Table (Manager Workflow) ─────────────────────────
    -- Tracks corrective repairs AND proactive service schedules.
    -- status flow: scheduled → in-service → awaiting-parts → ready → completed
    CREATE TABLE IF NOT EXISTS maintenance_orders (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id       UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        title            TEXT NOT NULL,
        description      TEXT,
        priority         TEXT DEFAULT 'medium',     -- 'high', 'medium', 'low'
        status           TEXT DEFAULT 'scheduled',  -- 'scheduled','in-service','awaiting-parts','ready','completed'
        order_type       TEXT DEFAULT 'corrective', -- 'corrective', 'proactive'
        mechanic_name    TEXT,
        scheduled_date   TIMESTAMPTZ,
        completed_date   TIMESTAMPTZ,
        estimated_cost   NUMERIC(12, 2),
        actual_cost      NUMERIC(12, 2),
        odometer_reading NUMERIC(10, 1),
        eta_parts        TEXT,                      -- e.g. '2 Days for Clutch Plate'
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE maintenance_orders DISABLE ROW LEVEL SECURITY;

    -- ── Compatibility Additions For Existing Databases ─────────────────────
    -- Users (required by profile + auth features)
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    -- Vehicles core + docs + categorization
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_number TEXT;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_document_url TEXT;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    -- Insurance policies + document upload support
    ALTER TABLE insurance_policies ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE insurance_policies ADD COLUMN IF NOT EXISTS document_url TEXT;
    ALTER TABLE insurance_policies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    -- Driver profile telemetry + assignment
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'HGMV';
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_expiry DATE;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 100;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS miles_this_month NUMERIC DEFAULT 0;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS total_incidents INTEGER DEFAULT 0;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    -- Dispatch lifecycle columns used by manager/admin/driver portals
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS progress_pct INTEGER DEFAULT 0;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS eta TEXT;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS speed NUMERIC DEFAULT 0;

    -- Optional: track vehicle fuel level (populated by drivers/IoT)
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_level INTEGER DEFAULT NULL;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT NULL;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'Truck';
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS functional_category TEXT DEFAULT 'Cargo';

    -- Backfill from legacy columns when present (older DBs used type/category)
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'vehicles' AND column_name = 'type'
        ) THEN
            EXECUTE 'UPDATE vehicles SET vehicle_type = COALESCE(NULLIF(TRIM(vehicle_type), ''''), NULLIF(TRIM(type), ''''), ''Truck'')';
        ELSE
            UPDATE vehicles
            SET vehicle_type = COALESCE(NULLIF(TRIM(vehicle_type), ''), 'Truck');
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'vehicles' AND column_name = 'category'
        ) THEN
            EXECUTE 'UPDATE vehicles SET functional_category = COALESCE(NULLIF(TRIM(functional_category), ''''), NULLIF(TRIM(category), ''''), ''Cargo'')';
        ELSE
            UPDATE vehicles
            SET functional_category = COALESCE(NULLIF(TRIM(functional_category), ''), 'Cargo');
        END IF;
    END
    $$;

    -- Enforce non-empty canonical values after backfill
    ALTER TABLE vehicles ALTER COLUMN vehicle_type SET NOT NULL;
    ALTER TABLE vehicles ALTER COLUMN functional_category SET NOT NULL;

    -- Remove the 'Truck'/'Cargo' column-level defaults that were only needed for backfill.
    -- Without these DROPs, PostgreSQL silently stores 'Truck'/'Cargo' whenever an INSERT
    -- omits the column, hiding real bugs. Now any INSERT that omits them will raise an
    -- explicit NOT NULL violation instead of silently saving the wrong default.
    ALTER TABLE vehicles ALTER COLUMN vehicle_type DROP DEFAULT;
    ALTER TABLE vehicles ALTER COLUMN functional_category DROP DEFAULT;

    -- ── Driver Portal Additions ──────────────────────────────────────────────
    -- Extra driver profile fields used by the driver portal
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS aadhar_number TEXT DEFAULT NULL;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS medical_cert_expiry DATE DEFAULT NULL;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL;
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS on_time_rate INTEGER DEFAULT 100;

    -- Vehicle registration certificate expiry (shown on Documents page)
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_expiry DATE DEFAULT NULL;

    -- ── Dispatch enrichment ───────────────────────────────────────────────────
    -- Trip completion timestamp + driver notes + odometer for distance tracking
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS trip_notes      TEXT;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS odometer_start  NUMERIC(10,1);
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS actual_distance  NUMERIC(10,1);

    -- Ride Requester additions
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS notes            TEXT;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS passenger_count  INTEGER DEFAULT 1;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS requested_date   DATE;

    -- Smart Trip Intelligence columns
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS distance_km         NUMERIC(10,1);
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS trip_classification  TEXT;           -- 'short','medium','long','ultra-long'
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS is_long_trip         BOOLEAN DEFAULT FALSE;
    ALTER TABLE dispatch_requests ADD COLUMN IF NOT EXISTS vip_required         BOOLEAN DEFAULT FALSE;

    -- Driver profile: cumulative odometer across all trips
    ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS total_distance NUMERIC(12,1) DEFAULT 0;

    -- ── Support Tickets Table ────────────────────────────────────────────────
    -- Raised by drivers; visible to managers/admins on fleet dashboard.
    -- Contains emergency SOS alerts (category = 'Emergency SOS') as well.
    CREATE TABLE IF NOT EXISTS support_tickets (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        driver_id   UUID REFERENCES users(id) ON DELETE CASCADE,
        category    TEXT DEFAULT 'Other',           -- 'Trip Issue','Vehicle Issue','Document Help','Emergency SOS','Other'
        subject     TEXT NOT NULL,
        description TEXT,
        status      TEXT DEFAULT 'open',            -- 'open','in-progress','resolved','closed'
        priority    TEXT DEFAULT 'medium',          -- 'high','medium','low'
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

    -- ═══════════════════════════════════════════════════════════════════════════
    -- ── VEHICLE MAINTENANCE & SERVICE TRACKING SYSTEM (v2) ──────────────────
    -- ═══════════════════════════════════════════════════════════════════════════

    -- ── Extend Vehicles for full Maintenance Health Profile ──────────────────
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type       TEXT DEFAULT 'diesel';  -- 'diesel','petrol','cng','electric','hybrid'
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage_km      NUMERIC(10,2) DEFAULT 0; -- current odometer reading
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_date   DATE DEFAULT NULL;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_cost   NUMERIC(12,2) DEFAULT NULL;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS warranty_expiry DATE DEFAULT NULL;

    -- ── Preventive Maintenance Schedules ─────────────────────────────────────
    -- Tracks time-based AND mileage-based service reminders per vehicle.
    -- e.g. Oil change every 5000 km / 3 months; Tyre rotation every 10000 km
    CREATE TABLE IF NOT EXISTS preventive_schedules (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id        UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        service_type      TEXT NOT NULL,       -- 'oil_change','tyre_rotation','brake_check','engine_service','filter_change','battery_check','ac_service','general_inspection'
        interval_km       NUMERIC(10,2),       -- km between services (NULL = time-only)
        interval_days     INTEGER,             -- days between services (NULL = km-only)
        last_service_km   NUMERIC(10,2),       -- odometer at last service
        last_service_date DATE,                -- date of last service
        next_due_km       NUMERIC(10,2),       -- computed: last_service_km + interval_km
        next_due_date     DATE,                -- computed: last_service_date + interval_days
        notes             TEXT,
        status            TEXT DEFAULT 'active', -- 'active','overdue','upcoming','completed'
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        updated_at        TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE preventive_schedules DISABLE ROW LEVEL SECURITY;

    -- ── Service Vendors / Authorised Garages ─────────────────────────────────
    -- Registry of service centres, garages, and authorised dealers.
    CREATE TABLE IF NOT EXISTS service_vendors (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name           TEXT NOT NULL,
        contact_person TEXT,
        phone          TEXT,
        email          TEXT,
        address        TEXT,
        city           TEXT,
        specialization TEXT DEFAULT 'general',  -- 'general','tyres','engine','electrical','body','ac','authorized_dealer'
        rating         NUMERIC(3,1) DEFAULT 5.0 CHECK (rating BETWEEN 1.0 AND 5.0),
        total_jobs     INTEGER DEFAULT 0,
        is_active      BOOLEAN DEFAULT true,
        created_at     TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE service_vendors DISABLE ROW LEVEL SECURITY;

    -- ── Vehicle Component Health Tracking ────────────────────────────────────
    -- Per-vehicle health % for individual components (battery, brakes, tyres…)
    CREATE TABLE IF NOT EXISTS vehicle_components (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        component_name  TEXT NOT NULL,   -- 'Battery','Brakes','Tyres','Engine','Transmission','AC','Lights','GPS','Suspension'
        health_pct      INTEGER DEFAULT 100 CHECK (health_pct BETWEEN 0 AND 100),
        last_replaced   DATE,
        notes           TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(vehicle_id, component_name)
    );
    ALTER TABLE vehicle_components DISABLE ROW LEVEL SECURITY;

    -- ── Compliance Records ────────────────────────────────────────────────────
    -- Tracks PUC, Fitness Certificate, State/National Permit, Road Tax per vehicle.
    CREATE TABLE IF NOT EXISTS compliance_records (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id   UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        record_type  TEXT NOT NULL,   -- 'pollution_cert','fitness_cert','national_permit','state_permit','road_tax','goods_permit'
        issued_date  DATE,
        expiry_date  DATE NOT NULL,
        authority    TEXT,            -- issuing authority / RTO / transport dept
        document_url TEXT,
        notes        TEXT,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE compliance_records DISABLE ROW LEVEL SECURITY;

    -- ── Vehicle Downtime Log ──────────────────────────────────────────────────
    -- Auto-logged when vehicle status changes to 'maintenance'; closed on completion.
    CREATE TABLE IF NOT EXISTS vehicle_downtime_logs (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id           UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        maintenance_order_id UUID REFERENCES maintenance_orders(id) ON DELETE SET NULL,
        downtime_start       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        downtime_end         TIMESTAMPTZ,
        reason               TEXT,
        total_hours          NUMERIC(10,2),   -- filled when downtime_end is set
        created_at           TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE vehicle_downtime_logs DISABLE ROW LEVEL SECURITY;

    -- ── Invoice & Ticket tracking for maintenance orders ─────────────────────
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS invoice_number       TEXT DEFAULT NULL;
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS invoice_total        NUMERIC(12,2) DEFAULT NULL;
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS invoice_notes        TEXT DEFAULT NULL;
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMPTZ DEFAULT NULL;
    -- Track which driver reported corrective orders via vehicle issue form
    ALTER TABLE maintenance_orders ADD COLUMN IF NOT EXISTS reported_by_driver_id UUID REFERENCES users(id) ON DELETE SET NULL DEFAULT NULL;