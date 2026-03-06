# TruMove — Fleet Intelligence Platform

> **Confidence in Every Mile**

TruMove is an enterprise-grade fleet management and intelligent dispatch platform built for logistics operations, transport companies, and corporate mobility fleets. It unifies real-time GPS tracking, AI-powered trip booking, driver lifecycle management, vehicle compliance, and maintenance operations into a single cohesive platform — accessible from any browser, with no native app required.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Who Uses TruMove](#2-who-uses-trumove)
3. [Feature Map](#3-feature-map)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [API Reference](#6-api-reference)
7. [Real-Time Engine](#7-real-time-engine)
8. [AI Dispatch — BookSmart](#8-ai-dispatch--booksmart)
9. [Smart Trip Intelligence](#9-smart-trip-intelligence)
10. [Security Architecture](#10-security-architecture)
11. [Frontend — Page Inventory](#11-frontend--page-inventory)
12. [File Storage](#12-file-storage)
13. [GPS Simulator](#13-gps-simulator)
14. [Deployment](#14-deployment)
15. [Environment Variables](#15-environment-variables)
16. [HTTP Status Codes](#16-http-status-codes)

---

## 1. Product Vision

Fleet management has historically meant spreadsheets, phone calls, and reactive fire-fighting. TruMove changes that. The platform was designed around three product principles:

**Predict before you react.** The Smart Trip Intelligence engine classifies every trip before it is even assigned — calculating distance tiers, flagging VIP requirements, scoring vehicle-driver pairings, and recommending the best match automatically. Dispatchers see the full picture in one click, not after three phone calls.

**Every role gets its own workspace.** A system administrator managing user approvals should never share a screen with a driver checking their next trip. TruMove ships three distinct portals — Admin, Manager, Driver — each designed from scratch for the exact decisions and actions that role makes every day.

**Real-time or nothing.** The Live Fleet Map is not a dashboard refresh. It is genuine WebSocket-based tracking: driver location updates stream continuously, markers move with smooth animation, trail polylines trace the route, and clicking any marker surfaces the full trip context — driver name, origin, destination, speed, heading, vehicle registration — without navigating away.

---

## 2. Who Uses TruMove

### System Administrator
Owns the platform. Approves new user registrations, manages the full vehicle registry, configures insurance policies, decommissions assets, and monitors the audit log. Has visibility into every table, every event, every user in the system. The audit ring buffer means nothing happens without a trace.

### Fleet Manager
Operates the fleet day-to-day. Manages the dispatch queue, monitors active trips on the live map, oversees maintenance work orders on a Kanban board, and watches the fleet status donut chart to keep utilisation high. The manager portal is purpose-built for operational decision-making — not data entry.

### Driver
Receives trip assignments, marks trips complete, reports vehicle issues, raises dispatch requests independently, views all personal documents, and contacts support or triggers an SOS alert. The driver portal is mobile-optimized and designed for use behind the wheel (before/after driving, not during).

---

## 3. Feature Map

### 3.1 Dispatch & Trip Management

**Manual Dispatch**
Dispatchers create a trip request by specifying origin, destination, cargo type, cargo weight, passenger count, priority level, and any notes. The system timestamps every dispatch with a unique ticket number.

**Auto-Assign Engine**
One button replaces the dispatch coordinator's entire decision process. The engine:
- Classifies the trip by distance and priority
- Detects VIP requirements from passenger count and keywords
- Scores every available vehicle against the recommended type and category
- Selects the driver with the highest safety score who is not currently on a trip
- Assigns, activates, and updates all statuses atomically

**Preview Mode**
Before committing any assignment, dispatchers can run a preview that returns the exact intelligence output — recommended vehicle type, recommended category, top-scored vehicle, best driver — without writing anything to the database. Full confidence before action.

**Trip Lifecycle**
Every trip moves through a defined state machine:

```
pending → active → completed
           ↓
        rejected
```

When a trip moves to `active`, the assigned driver status changes from `available` to `on-trip` and the vehicle status changes from `active` to `on-trip`. When a trip completes or is rejected, both are released back to their available states atomically.

**Driver-Initiated Dispatch**
Drivers can raise their own dispatch requests from the driver portal. The system performs three eligibility checks server-side before auto-approving: the vehicle must not be in maintenance or blocked, must not already be on an active trip, and must have valid insurance coverage. If all pass, the trip is immediately activated.

### 3.2 Live Fleet Map

The flagship real-time feature. Available in two modes:

**Embedded Admin Dashboard Map**
The "Live Fleet Telemetry" panel on the admin dashboard replaces any static image with a live Leaflet.js map. Every driver currently on a trip appears as a colour-coded animated truck marker. Trails show the last 30 location points. Clicking any marker opens a full driver detail modal:
- Driver name and fleet status
- Current speed (km/h) with a visual speed bar (0–120 km/h scale)
- Heading (N, NE, E, SE, S, SW, W, NW)
- Last ping timestamp
- Origin → Destination route
- Vehicle registration number
- Live GPS coordinates
- "Full Map" button to navigate to the dedicated map view

**Full-Screen Manager Live Map (`LiveMap_manager.html`)**
A dedicated full-screen map view for fleet managers:
- Leaflet.js on CartoDB light tiles, centred on Chennai
- Smooth 800ms interpolated marker movement (cubic ease-in-out)
- Per-driver colour-coded polyline trails (last 40 points)
- Driver list panel on the right showing all active drivers
- Dark map toggle, Fit All button, trail toggle
- Bottom-left driver detail popup on marker click
- Socket.IO `location:update` event listener for zero-latency updates
- 10-minute stale driver cleanup

Both map views initialise by fetching the `/api/dispatch/live-locations` endpoint to load any already-transmitting drivers, then subscribe to Socket.IO for all subsequent updates.

### 3.3 AI Dispatch — BookSmart

A conversational trip booking assistant powered by Google Gemini 2.5 Flash. Instead of filling a form, the user has a conversation:

BookSmart asks about origin and destination, urgency, whether premium service is needed, cargo or passenger details, and any special requirements. From this conversation it extracts structured data — priority level, recommended vehicle type, functional category, estimated distance — and pre-fills the booking form. The driver or admin reviews the extracted data and confirms, rather than typing everything from scratch.

The conversation is managed via multi-turn message history sent to Gemini on every turn, with a carefully engineered system prompt that keeps the assistant focused on dispatch context and prevents off-topic responses. Safety filters block harassment, hate speech, explicit content, and dangerous content at the API level.

### 3.4 Vehicle Registry & Compliance

**Vehicle Registration**
Every vehicle is registered with make, model, year, VIN (unique), registration number, engine number, vehicle type (Car, Bus, Truck, EV, Two-wheeler) and functional category (Passenger, Cargo, VIP Transport, Emergency, Maintenance). RC documents are uploaded directly and stored in Supabase Storage.

**Status Lifecycle**

```
active ←→ on-trip
  ↕
maintenance
  ↕
blocked
```

Status transitions are enforced at the controller layer. A vehicle on a trip cannot be manually taken to maintenance until the trip completes.

**Insurance Management**
Every vehicle is tracked against its insurance policy. The system maintains:
- Days-to-expiry for every policy
- Coverage percentage across the fleet
- An urgent list of expired policies and those expiring within 7 days
- A 30-day upcoming renewals view
- A fleet-view that classifies every asset as: active, expiring, critical (≤7 days), expired, or uninsured

When a driver raises a dispatch request, insurance validity is checked in real time before the trip is allowed to activate.

### 3.5 Driver Management & Profiles

Each driver has a profile beyond their user account: license number and type (HGMV, LMV, etc.), license expiry, Aadhaar number, medical certificate expiry, address, years of experience, safety score (0–100), on-time rate, miles driven this month, total distance, and incident count.

Admins can update profiles, assign preferred vehicles, and update availability status. Managers can monitor the driver grid, filter by status (available / on-trip / off-duty), and open a full profile drawer with one click.

**Driver Safety Scoring** is used as the primary criterion in the auto-assign engine — the highest-scoring available driver is always selected first.

### 3.6 Maintenance Management

Fleet managers operate a full maintenance workflow:

**Work Orders** are created for either corrective issues (reported breakdowns) or proactive service (scheduled maintenance). Each order carries a title, description, priority (high/medium/low), mechanic name, scheduled date, estimated cost, actual cost, and odometer reading.

**Kanban Board** tracks work orders through five stages:
```
Scheduled → In Service → Awaiting Parts → Ready → Completed
```

Managers drag cards between columns. Status updates trigger vehicle status changes — setting a vehicle to maintenance removes it from dispatch eligibility.

**Cost Charts** show the last 6 months of maintenance expenditure, enabling budget planning and trend identification.

**Driver-Reported Issues** — Drivers can report mechanical issues directly from the vehicle status page. High-priority reports automatically set the vehicle status to `maintenance`, immediately removing it from the dispatch pool.

### 3.7 Driver Portal

The driver-facing interface is a self-service hub:

- **Dashboard** — Current trip, vehicle status summary, upcoming schedule, quick action buttons
- **My Trips** — Tabbed view of upcoming (pending/active) and history (completed/rejected) trips, with a "Complete Trip" action for active assignments
- **Vehicle Status** — Assigned vehicle details, fuel level, next maintenance date, insurance expiry
- **Documents** — License, Aadhaar, medical certificate, vehicle RC, and insurance documents with download links
- **Support & SOS** — Emergency contact list (all managers and admins), support ticket form with category selection (Trip Issue, Vehicle Issue, Document Help, Emergency SOS), one-tap SOS that instantly creates a high-priority emergency ticket

### 3.8 System Administration

**User Approval Workflow**
Every new registration starts as pending. Admins review pending users, see their role and company, and approve or reject. Approved users get access to their role's portal; rejected registrations are deleted.

**Audit Log**
An in-memory circular ring buffer (capacity: 500 entries) records every significant action on the platform: vehicles added or decommissioned, users deleted or role-changed, trips completed, system starts. The log is queryable by event type, severity (INFO, WARNING, CRITICAL), and full-text search. It is visible only to administrators.

**System Dashboard**
Real-time table row counts, recent fleet activity (last 20 vehicles, 20 trips, 10 maintenance orders), and full user registry management including role changes and approval toggles.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   Admin Portal   │  Manager Portal  │   Driver Portal       │
│   (HTML/CSS/JS)  │  (HTML/CSS/JS)   │   (HTML/CSS/JS)       │
│                  │                  │                        │
│         BookSmart AI Chat Interface                         │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                     SERVER LAYER (Node.js 20)               │
│                                                             │
│  Express.js REST API          Socket.IO (WS)               │
│  ├─ Auth middleware (JWT)     └─ location:update event      │
│  ├─ Role-based authorization                               │
│  ├─ Multer (file uploads)                                   │
│  ├─ CORS                                                    │
│  └─ Static file serving                                     │
│                                                             │
│  Controllers                                                │
│  ├─ auth       ├─ vehicle    ├─ dispatch   ├─ sysadmin     │
│  ├─ driver     ├─ insurance  ├─ manager    ├─ ai           │
│  └─ dashboard  └─ user       └─ driver_portal              │
│                                                             │
│  In-Memory Stores                                           │
│  ├─ liveLocations Map<driver_id, GPSPayload>                │
│  └─ auditLog  CircularBuffer[500]                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴──────────────────┐
          │                                   │
┌─────────▼──────────┐             ┌──────────▼──────────┐
│   Supabase (PG)    │             │  Supabase Storage    │
│   PostgreSQL DB    │             │  fleet-documents     │
│   ├─ users         │             │  ├─ rc/ (RC docs)   │
│   ├─ vehicles      │             │  └─ insurance/       │
│   ├─ driver_profiles│            └─────────────────────┘
│   ├─ dispatch_requests│
│   ├─ insurance_policies│
│   ├─ maintenance_orders│
│   └─ support_tickets│
└────────────────────┘
          │
┌─────────▼──────────┐
│  Google Gemini API  │
│  gemini-2.5-flash  │
│  (BookSmart AI)    │
└────────────────────┘
```

**Technology Stack**

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Web Framework | Express.js 4.18 |
| Real-time | Socket.IO 4.8 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (jsonwebtoken 9.0), bcryptjs |
| File Storage | Supabase Storage |
| AI | Google Gemini 2.5 Flash |
| Maps (Frontend) | Leaflet.js 1.9.4 |
| Charts (Frontend) | ApexCharts |
| Deployment | Firebase App Hosting / Procfile (any PaaS) |
| Dev tooling | nodemon |

---

## 5. Database Design

### users
Stores all platform users — administrators, managers, and drivers — with role-based access control.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `email` | TEXT | Unique, required |
| `password_hash` | TEXT | bcrypt (10 rounds) |
| `full_name` | TEXT | Display name |
| `company_name` | TEXT | Organisation |
| `role` | ENUM | `admin` \| `manager` \| `driver` |
| `is_approved` | BOOLEAN | Default false; admins auto-approved |
| `avatar_url` | TEXT | Profile picture |
| `created_at` | TIMESTAMPTZ | Auto-set |

### vehicles
The full asset registry for every vehicle in the fleet.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `make` | TEXT | Manufacturer |
| `model` | TEXT | Model name |
| `year` | INT | Manufacturing year |
| `vin` | TEXT | Unique chassis number |
| `registration_number` | TEXT | Unique plate number |
| `engine_number` | TEXT | Engine serial |
| `vehicle_type` | TEXT | `Car` \| `Bus` \| `Truck` \| `EV` \| `Two-wheeler` |
| `functional_category` | TEXT | `Passenger` \| `Cargo` \| `VIP transport` \| `Emergency` \| `Maintenance` |
| `status` | TEXT | `active` \| `on-trip` \| `maintenance` \| `blocked` |
| `rc_document_url` | TEXT | Supabase Storage URL |
| `rc_expiry` | DATE | RC expiry date |
| `fuel_level` | INTEGER | Percentage 0–100 |
| `current_location` | TEXT | Last known location text |

### driver_profiles
Driver-specific metadata and performance metrics, linked 1:1 to users.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id (unique) |
| `phone` | TEXT | Contact number |
| `license_number` | TEXT | DL number |
| `license_type` | TEXT | Default `HGMV` |
| `license_expiry` | DATE | DL expiry |
| `aadhar_number` | TEXT | Aadhaar ID |
| `medical_cert_expiry` | DATE | Medical certificate |
| `address` | TEXT | Residential address |
| `safety_score` | INTEGER | 0–100, used in auto-assign |
| `on_time_rate` | INTEGER | Percentage |
| `miles_this_month` | NUMERIC | Current month mileage |
| `total_distance` | NUMERIC(12,1) | Lifetime distance |
| `total_incidents` | INTEGER | Incident count |
| `years_experience` | INTEGER | Years driving |
| `assigned_vehicle_id` | UUID | FK → vehicles.id |
| `status` | TEXT | `available` \| `on-trip` \| `off-duty` |

### dispatch_requests
The core trip record — every journey from request to completion.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `ticket_number` | TEXT | Unique reference (e.g. `DISP-20240301-AB12`) |
| `origin` | TEXT | Pickup point |
| `destination` | TEXT | Drop point |
| `cargo_type` | TEXT | Goods description |
| `cargo_weight` | TEXT | Weight range |
| `notes` | TEXT | Special instructions |
| `passenger_count` | INTEGER | Default 1 |
| `requested_date` | DATE | Desired travel date |
| `priority` | TEXT | `high` \| `standard` \| `vip` |
| `distance_km` | NUMERIC(10,1) | Estimated distance |
| `trip_classification` | TEXT | `short` \| `medium` \| `long` \| `ultra-long` |
| `is_long_trip` | BOOLEAN | Distance > 200 km or time > 4 h |
| `vip_required` | BOOLEAN | VIP service required |
| `status` | TEXT | `pending` \| `active` \| `completed` \| `rejected` |
| `driver_id` | UUID | FK → users.id |
| `vehicle_id` | UUID | FK → vehicles.id |
| `progress_pct` | INTEGER | Trip progress 0–100 |
| `eta` | TEXT | Estimated arrival |
| `speed` | NUMERIC | Current speed |
| `odometer_start` | NUMERIC(10,1) | Starting odometer |
| `actual_distance` | NUMERIC(10,1) | Recorded distance on completion |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |
| `trip_notes` | TEXT | Post-trip notes |

### insurance_policies
Vehicle insurance records with full document tracking.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `vehicle_id` | UUID | FK → vehicles.id |
| `provider` | TEXT | Insurance company name |
| `policy_number` | TEXT | Policy reference |
| `start_date` | DATE | Coverage start |
| `expiry_date` | DATE | Coverage end |
| `document_url` | TEXT | Supabase Storage URL |

### maintenance_orders
Work orders for corrective and proactive vehicle maintenance.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `vehicle_id` | UUID | FK → vehicles.id |
| `title` | TEXT | Short description |
| `description` | TEXT | Detailed notes |
| `priority` | TEXT | `high` \| `medium` \| `low` |
| `status` | TEXT | `scheduled` \| `in-service` \| `awaiting-parts` \| `ready` \| `completed` |
| `order_type` | TEXT | `corrective` \| `proactive` |
| `mechanic_name` | TEXT | Assigned technician |
| `scheduled_date` | TIMESTAMPTZ | Planned service date |
| `completed_date` | TIMESTAMPTZ | Actual completion |
| `estimated_cost` | NUMERIC(12,2) | Budget |
| `actual_cost` | NUMERIC(12,2) | Actual spend |
| `odometer_reading` | NUMERIC(10,1) | Reading at service |
| `eta_parts` | TEXT | Parts delivery ETA |

### support_tickets
Driver and operational support issues with category triage.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `driver_id` | UUID | FK → users.id |
| `category` | TEXT | `Trip Issue` \| `Vehicle Issue` \| `Document Help` \| `Emergency SOS` \| `Other` |
| `subject` | TEXT | Short summary |
| `description` | TEXT | Full description |
| `status` | TEXT | `open` \| `in-progress` \| `resolved` \| `closed` |
| `priority` | TEXT | `high` \| `medium` \| `low` |

---

## 6. API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user. Admins auto-approved; others set `is_approved=false` |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT (8-hour expiry) |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/pending` | Admin | List unapproved registrations |
| `GET` | `/api/users/approved` | Admin | List approved users |
| `PUT` | `/api/users/approve/:userId` | Admin | Approve pending user |
| `DELETE` | `/api/users/reject/:userId` | Admin | Reject and delete user |
| `PUT` | `/api/users/profile` | Authenticated | Update own profile |
| `PUT` | `/api/users/password` | Authenticated | Change own password |

### Vehicles — `/api/vehicles`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | Admin/Manager | All vehicles with insurance data |
| `GET` | `/api/vehicles/:vehicleId` | Admin/Manager | Single vehicle detail |
| `POST` | `/api/vehicles` | Admin | Register new vehicle (multipart: RC + insurance documents) |
| `PUT` | `/api/vehicles/:vehicleId` | Admin | Update vehicle fields |
| `PUT` | `/api/vehicles/:vehicleId/status` | Admin/Manager | Update status |
| `DELETE` | `/api/vehicles/:vehicleId` | Admin | Decommission vehicle (requires reason) |

### Insurance — `/api/insurance`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/insurance` | Admin/Manager | All policies with vehicle joins |
| `GET` | `/api/insurance/stats` | Admin/Manager | Coverage KPIs |
| `GET` | `/api/insurance/urgent` | Admin/Manager | Expired + expiring ≤ 7 days |
| `GET` | `/api/insurance/upcoming` | Admin/Manager | Renewals in next 30 days |
| `GET` | `/api/insurance/fleet-view` | Admin/Manager | Vehicle-centric risk view |
| `POST` | `/api/insurance` | Admin | Add new policy |
| `PUT` | `/api/insurance/:policyId` | Admin | Renew/update policy |
| `DELETE` | `/api/insurance/:policyId` | Admin | Delete policy |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Admin/Manager | Fleet KPI summary |

### Drivers — `/api/drivers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/drivers` | Admin/Manager | All drivers with profiles |
| `GET` | `/api/drivers/stats` | Admin/Manager | Driver count by status |
| `GET` | `/api/drivers/:driverId` | Admin/Manager | Single driver profile |
| `PUT` | `/api/drivers/:driverId/profile` | Admin | Create/update driver profile |
| `PUT` | `/api/drivers/:driverId/status` | Admin/Manager | Update availability |

### Dispatch — `/api/dispatch`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dispatch/stats` | Admin/Manager | Dispatch KPIs |
| `GET` | `/api/dispatch/pending` | Admin/Manager | Pending trip requests |
| `GET` | `/api/dispatch/active` | Admin/Manager | Active trips |
| `GET` | `/api/dispatch/history` | Admin/Manager | Completed and rejected trips |
| `GET` | `/api/dispatch/preview-assign` | Admin/Manager | Preview auto-assign (read-only) |
| `GET` | `/api/dispatch/live-locations` | Admin/Manager | Real-time driver GPS (last 5 min) |
| `POST` | `/api/dispatch` | Admin/Manager | Create manual dispatch request |
| `POST` | `/api/dispatch/auto-assign` | Admin/Manager | Auto-assign and activate trip |
| `PUT` | `/api/dispatch/approve/:requestId` | Admin/Manager | Approve and activate dispatch |
| `PUT` | `/api/dispatch/complete/:requestId` | Admin/Manager | Mark trip completed |
| `DELETE` | `/api/dispatch/reject/:requestId` | Admin/Manager | Reject dispatch |
| `POST` | `/api/dispatch/location` | Public | Receive GPS coordinates from driver/simulator |

### Manager Portal — `/api/manager`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/manager/dashboard-stats` | Manager/Admin | Manager KPI summary |
| `GET` | `/api/manager/fleet-summary` | Manager/Admin | Fleet donut counts |
| `GET` | `/api/manager/fleet` | Manager/Admin | All vehicles with trip context |
| `GET` | `/api/manager/maintenance` | Manager/Admin | Work orders (filterable) |
| `GET` | `/api/manager/maintenance/stats` | Manager/Admin | Maintenance KPIs |
| `GET` | `/api/manager/maintenance/cost-chart` | Manager/Admin | 6-month cost chart data |
| `GET` | `/api/manager/maintenance/proactive` | Manager/Admin | Scheduled proactive service |
| `POST` | `/api/manager/maintenance` | Manager/Admin | Create work order |
| `PATCH` | `/api/manager/maintenance/:orderId/status` | Manager/Admin | Update Kanban status |
| `GET` | `/api/manager/activity` | Manager/Admin | Recent activity feed |

### Driver Portal — `/api/driver`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/driver/me` | Driver | Own profile and assigned vehicle |
| `GET` | `/api/driver/current-trip` | Driver | Active or pending trip |
| `GET` | `/api/driver/trips` | Driver | `?view=upcoming` or `?view=history` |
| `GET` | `/api/driver/trips/stats` | Driver | Safety score, miles, on-time rate |
| `PUT` | `/api/driver/trips/:tripId/complete` | Driver | Mark own trip as complete |
| `GET` | `/api/driver/vehicle` | Driver | Assigned vehicle + insurance + next maintenance |
| `POST` | `/api/driver/vehicle/issue` | Driver | Report mechanical issue |
| `GET` | `/api/driver/vehicle/maintenance-history` | Driver | Maintenance history |
| `GET` | `/api/driver/documents` | Driver | All personal and vehicle documents |
| `GET` | `/api/driver/support/contacts` | Driver | List of managers and admins |
| `GET` | `/api/driver/support/tickets` | Driver | Own support tickets |
| `POST` | `/api/driver/support/tickets` | Driver | Create support ticket |
| `GET` | `/api/driver/available-vehicles` | Driver | Eligible vehicles for dispatch |
| `GET` | `/api/driver/vehicle-lookup` | Driver | Lookup by `?last4=XXXX` |
| `POST` | `/api/driver/dispatch` | Driver | Raise and auto-approve dispatch |
| `POST` | `/api/driver/sos` | Driver | Trigger emergency SOS |

### System Admin — `/api/sysadmin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/sysadmin/overview` | Admin | System snapshot |
| `GET` | `/api/sysadmin/audit-log` | Admin | Query audit log (`?limit` `?type` `?sev` `?q`) |
| `GET` | `/api/sysadmin/users` | Admin | Full user registry |
| `DELETE` | `/api/sysadmin/users/:userId` | Admin | Hard delete user |
| `PUT` | `/api/sysadmin/users/:userId/role` | Admin | Change user role |
| `PUT` | `/api/sysadmin/users/:userId/approval` | Admin | Toggle approval |
| `GET` | `/api/sysadmin/db-stats` | Admin | Table row counts |
| `GET` | `/api/sysadmin/fleet-activity` | Admin | Recent fleet activity |

### AI Dispatch — `/api/ai`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/ai/greeting` | Authenticated | Opening message (no AI call) |
| `POST` | `/api/ai/chat` | Authenticated | Conversational dispatch booking via Gemini |

---

## 7. Real-Time Engine

TruMove uses Socket.IO 4.8 over a native `http.createServer` wrapper on the Express app. This allows HTTP and WebSocket traffic to share the same port.

**Server initialisation:**
```js
const http    = require('http');
const { Server: SocketServer } = require('socket.io');
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer, { cors: { origin: '*' } });
app.set('io', io);
httpServer.listen(PORT);
```

**Location update flow:**

```
Driver App / GPS Simulator
        │
        │  POST /api/dispatch/location
        │  { driver_id, lat, lng, speed, heading, driver_name,
        │    vehicle_reg, origin, destination }
        ▼
  dispatch.controller.js
  └─ liveLocations.set(driver_id, { ...payload, updated_at })
  └─ io.emit('location:update', payload)  ← broadcasts to ALL connected clients
        │
        ├──→ Admin Dashboard  (location:update listener → processAdminLocation)
        └──→ Manager Live Map (location:update listener → processUpdate)
```

**In-memory location store:**
- `Map<driver_id, GPSPayload>` — last known position per driver
- `GET /api/dispatch/live-locations` returns all drivers updated within the last 5 minutes
- No persistence — data lives only in server memory
- Stale cleanup runs client-side (10-minute cutoff removes markers from the map)

**Events:**

| Event | Direction | Payload |
|---|---|---|
| `location:update` | Server → All Clients | `{ driver_id, lat, lng, speed, heading, driver_name, vehicle_reg, origin, destination, updated_at }` |

---

## 8. AI Dispatch — BookSmart

BookSmart is the AI-powered trip booking interface. It exposes a chat API backed by Google Gemini 2.5 Flash with a structured system prompt that guides the conversation toward collecting all data needed to create a dispatch request.

**Conversation design:**
The assistant collects five pieces of information in natural conversation order:
1. Origin and destination
2. Urgency (determines priority: `standard`, `high`, `emergency`)
3. Service level preference (determines `vip` flag)
4. Cargo type and weight, or passenger count
5. Special requirements (dangerous goods, temperature control, accessibility)

**Output format:**
Every AI response includes a `formData` object alongside the chat reply:
```json
{
  "reply": "Great, I have Adyar to OMR. Is this trip urgent or can we schedule it?",
  "formData": {
    "origin": "Adyar",
    "destination": "OMR",
    "priority": "standard",
    "vehicle_type": null,
    "functional_category": null,
    "distance_km": null,
    "is_ready": false
  }
}
```

Once `is_ready` is `true`, the frontend populates the booking form automatically. The user reviews and confirms — reducing booking time from minutes to seconds.

**API configuration:**
- Model: `gemini-2.5-flash`
- Temperature: 0.75
- Max output tokens: 512
- Safety filters: BLOCK_MEDIUM_AND_ABOVE for harassment, hate speech, sexually explicit, dangerous content
- Error handling: 502 for API errors, 503 if API key not configured, 504 for timeout (>18 seconds)

---

## 9. Smart Trip Intelligence

Every trip — whether created manually, via auto-assign, or via BookSmart — passes through the trip intelligence engine.

**Distance classification:**

| Distance | Classification |
|---|---|
| < 50 km | short |
| 50 – 200 km | medium |
| 200 – 500 km | long |
| > 500 km | ultra-long |

**Long-trip flag:**
A trip is flagged `is_long_trip = true` when distance exceeds 200 km, or when the estimated travel time exceeds 4 hours. Long trips trigger additional planning considerations and are surfaced separately in the dispatch console.

**VIP detection:**
`vip_required = true` when any of these conditions are met:
- Priority field is set to `vip`
- Passenger count exceeds 10
- Notes contain VIP keywords: `vip`, `executive`, `minister`, `chairman`, `ceo`, `president`, `director`

**Vehicle scoring algorithm (auto-assign):**
```
base_score = 0
+30  if vehicle_type matches recommended type
+25  if functional_category matches recommended category
+15  if user explicitly selected this type
+10  if fuel_level > 80%
+  5  if fuel_level > 50%
```
The vehicle with the highest score is selected. Tied scores fall back to registration number alphabetical order for determinism.

**Driver selection:**
- Must have `status = 'available'`
- Must not have any active trip in `dispatch_requests`
- Ranked by `safety_score` descending
- If the highest-scoring driver has their `assigned_vehicle_id` matching the selected vehicle, that pairing is preferred

---

## 10. Security Architecture

**Authentication:**
- JWT tokens signed with `JWT_SECRET`, 8-hour expiry
- Tokens carried in `Authorization: Bearer <token>` headers
- Passwords hashed with bcrypt at 10 salt rounds — plaintext passwords never stored or logged

**Authorisation:**
- Three roles: `admin`, `manager`, `driver`
- Every protected route uses `authenticate` middleware (validates JWT, populates `req.user`)
- Role enforcement via `authorize(...roles)` middleware applied per-route
- GPS location endpoint (`POST /api/dispatch/location`) is intentionally public to allow simulator and device posting

**Supabase:**
- Backend uses `service_role` key — bypasses Supabase RLS
- All access control is enforced at the Express layer
- Key is never exposed to any frontend page

**File uploads:**
- MIME type whitelist: PDF, JPG, PNG
- File size limit: 10 MB per upload
- Stored with timestamped paths to avoid collisions

**Audit trail:**
- CRITICAL severity events: vehicle decommissioned, user hard-deleted
- WARNING severity events: role changes, approval toggles
- INFO severity events: system starts, vehicle additions, trip completions
- 500-entry circular buffer — oldest events discarded when full
- Accessible only to `admin` role

**Input validation:**
- Required field checks on all mutation endpoints (400 on missing fields)
- Conflict detection for duplicate email, VIN, registration number (409)
- Supabase query parameters use the SDK's parameterised API — no raw SQL string concatenation

---

## 11. Frontend — Page Inventory

### Public

| Page | Purpose |
|---|---|
| `home.html` | Landing page — hero section, animated tagline, feature cards, CTA |
| `login.html` | Split-screen login with role-aware context |
| `signup.html` | Role selector with multi-step registration form |
| `BookSmart.html` | AI dispatch chat interface |

### Admin Portal

| Page | Purpose |
|---|---|
| `Dasboard_admin.html` | Admin mission control — KPI cards, live Leaflet map with driver detail modal, dispatch list, fleet donut chart, activity feed |
| `User_Approval_admin.html` | Pending and approved user management, approve/reject actions |
| `Driver_management_admin.html` | Driver grid with status filters, safety score display, profile drawer |
| `Dispatch_Control_admin.html` | Dispatch console — KPI row, pending requests, auto-assign with preview, trip history |
| `Vehicle_Management_admin.html` | Vehicle registry — search, add vehicle with document upload, status management, on-trip badge |
| `Insurance_admin.html` | Insurance dashboard — coverage KPIs, policy table, urgent alerts, renewal chart |
| `Setting_admin.html` | Admin account and platform settings |
| `System_Control_admin.html` | Audit log, database stats, system health, user registry management |

### Manager Portal

| Page | Purpose |
|---|---|
| `manager/Dashboard_manager.html` | Dark-theme manager dashboard — KPI cards, dispatch queue, fleet donut, maintenance upcoming, activity feed |
| `manager/Drivers_manager.html` | Driver search, status filters, driver cards, profile drawer |
| `manager/View_fleet_manager.html` | Vehicle grid — search by reg/driver/type, status filters, vehicle detail drawer |
| `manager/Maintenance_manager.html` | Kanban maintenance board — 5-stage pipeline, work order cards, cost charts, new order modal |
| `manager/LiveMap_manager.html` | Full-screen live fleet map — Leaflet, Socket.IO, trail polylines, dark mode, driver detail popup |

### Driver Portal

| Page | Purpose |
|---|---|
| `driver/dashboard_driver.html` | Driver home — current trip, vehicle summary, quick actions |
| `driver/MyTrips_driver.html` | Upcoming and history trips, complete trip action |
| `driver/Vehicle_status_driver.html` | Assigned vehicle, fuel, maintenance, insurance status |
| `driver/Documents_driver.html` | License, Aadhaar, medical cert, RC, insurance documents |
| `driver/support_driver.html` | Support contacts, ticket form, SOS emergency button |

**Frontend stack (no build step required):**
- Vanilla HTML, CSS, JavaScript — no framework dependency
- Font Awesome 6 (icons)
- Google Fonts — Outfit (headings), Inter (body)
- ApexCharts (donut, bar, area charts)
- Leaflet.js 1.9.4 (maps)
- Socket.IO client served from `/socket.io/socket.io.js`
- All API calls use `fetch()` with `Authorization: Bearer` headers

---

## 12. File Storage

Supabase Storage bucket: `fleet-documents`

| File Type | Path Pattern |
|---|---|
| Vehicle RC document | `rc/{timestamp}_{VIN}.{ext}` |
| Insurance policy document | `insurance/{timestamp}_{vehicle_id}.{ext}` |

Accepted formats: PDF, JPG, PNG. Maximum size: 10 MB. URLs are stored in the database and served via Supabase's public CDN.

---

## 13. GPS Simulator

`simulate_drivers.py` provides a multi-threaded GPS simulator for development and live demo environments. It posts realistic location updates for five simulated drivers moving along real Chennai city routes.

**Routes:**

| Driver | Route | Waypoints | Base Speed |
|---|---|---|---|
| Arjun Selvam (TN-01-AX-2024) | Chennai Central → Marina Beach | 23 | 42 km/h |
| Priya Rangan (TN-04-BZ-5678) | Anna Nagar → Guindy | 26 | 55 km/h |
| Karthik Murugan (TN-09-CQ-9900) | Adyar → Sholinganallur (OMR) | 25 | 48 km/h |
| Deepa Krishnan (TN-22-DM-1122) | Egmore → Aminjikarai | 24 | 38 km/h |
| Senthil Pandi (TN-01-EP-7777) | Tambaram → Guindy (GST Road) | 34 | 68 km/h |

Total: 156 waypoints across 5 routes.

**Behaviour:**
- Each driver runs in a daemon thread
- Location posts every ~1.2 seconds with ±5 km/h randomised speed variation
- Haversine-based bearing calculation for realistic heading values
- Cubic waypoint interpolation for smooth marker movement on the client
- Routes loop continuously (driver restarts from origin when destination reached)
- Server connectivity check on startup before beginning simulation

**Usage:**
```bash
python simulate_drivers.py
```
Requires the server running on `localhost:3000`.

---

## 14. Deployment

**Local development:**
```bash
cd server
npm install
npm run dev        # starts with nodemon on port 3000
```

**Production (any PaaS with Procfile support):**
```
web: node server/server.js
```

**Firebase App Hosting:**
`apphosting.yaml` configures Firebase App Hosting deployment. The server exports `app` as a Cloud Function entry point for Firebase Functions compatibility.

**Port:** 3000 (configurable via `PORT` environment variable).

---

## 15. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service_role key (not anon key) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `GOOGLE_API_KEY` | Yes (for AI) | Google Gemini API key |
| `NODE_ENV` | No | `production` or `development` |
| `PORT` | No | Server port (default: 3000) |

---

## 16. HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation failure or missing required field |
| `401` | Missing or invalid JWT token |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `409` | Conflict — duplicate email, VIN, or registration number |
| `500` | Server or database error |
| `502` | AI service error (Gemini API returned an error) |
| `503` | AI service not configured (missing `GOOGLE_API_KEY`) |
| `504` | AI response timeout (Gemini took longer than 18 seconds) |

---

*TruMove — Built to help you grow. Confidence in Every Mile.*