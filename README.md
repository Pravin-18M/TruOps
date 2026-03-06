<p align="center">
  <img src="https://img.shields.io/badge/TruOps-by%20TruFleet-2563EB?style=for-the-badge&logoColor=white" alt="TruOps by TruFleet" />
  <br/>
  <strong>Intelligent Fleet Operations & Vehicle Lifecycle Management Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-20.x-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/express-4.18-000000?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/firebase-Hosting%20%2B%20Functions-FFCA28?style=flat-square&logo=firebase" />
  <img src="https://img.shields.io/badge/socket.io-Realtime-010101?style=flat-square&logo=socket.io" />
  <img src="https://img.shields.io/badge/Gemini%20AI-BookSmart-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" />
</p>

---

# TruOps — By TruFleet

> **TruOps** is an enterprise-grade, AI-augmented fleet operations platform that unifies vehicle lifecycle management, intelligent dispatch, predictive maintenance scheduling, regulatory compliance tracking, insurance oversight, and driver self-service into a single command-and-control system — purpose-built for logistics, transportation, and fleet-intensive businesses operating at scale.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [The Problem: Why Fleet Operations Fail](#the-problem-why-fleet-operations-fail)
- [How TruOps Solves It](#how-truops-solves-it)
- [Feature Highlight: Vehicle Maintenance Scheduling & Its Business Impact](#feature-highlight-vehicle-maintenance-scheduling--its-business-impact)
  - [The Cost of Unplanned Downtime](#the-cost-of-unplanned-downtime)
  - [Maintenance Capabilities in TruOps](#maintenance-capabilities-in-truops)
  - [Business Impact & ROI](#business-impact--roi)
- [Platform Modules](#platform-modules)
  - [1. Command Dashboard (Admin)](#1-command-dashboard-admin)
  - [2. Vehicle Fleet Registry](#2-vehicle-fleet-registry)
  - [3. Intelligent Dispatch & Auto-Assignment](#3-intelligent-dispatch--auto-assignment)
  - [4. Maintenance Operations Hub](#4-maintenance-operations-hub)
  - [5. Insurance & Coverage Intelligence](#5-insurance--coverage-intelligence)
  - [6. Driver Management](#6-driver-management)
  - [7. Driver Self-Service Portal](#7-driver-self-service-portal)
  - [8. Compliance & Regulatory Tracking](#8-compliance--regulatory-tracking)
  - [9. System Administration & Audit](#9-system-administration--audit)
  - [10. BookSmart AI — Conversational Dispatch](#10-booksmart-ai--conversational-dispatch)
- [Role-Based Access Architecture](#role-based-access-architecture)
- [Technical Architecture](#technical-architecture)
  - [System Architecture Diagram](#system-architecture-diagram)
  - [Technology Stack](#technology-stack)
  - [Database Schema](#database-schema)
  - [API Reference](#api-reference)
  - [Authentication & Authorization](#authentication--authorization)
  - [Real-Time Architecture](#real-time-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
  - [Deploying to Production](#deploying-to-production)
- [Industry Context & Competitive Positioning](#industry-context--competitive-positioning)
- [Roadmap](#roadmap)

---

## Executive Summary

The global fleet management market is projected to reach **$52.4 billion by 2030** (Allied Market Research), driven by the critical need to reduce operational costs, ensure regulatory compliance, and maximize vehicle uptime. Yet most fleet operators — especially in the Indian logistics corridor — still rely on fragmented tools: spreadsheets for maintenance, WhatsApp for dispatch, paper files for compliance, and phone calls for emergencies.

**TruOps** eliminates this operational fragmentation. It delivers a unified digital command center where every vehicle, every driver, every maintenance event, every insurance policy, and every trip is tracked, scheduled, analyzed, and acted upon — from a single browser tab.

### Key Metrics TruOps Targets

| Metric | Industry Avg (Manual) | With TruOps | Impact |
|--------|----------------------|-------------|--------|
| Unplanned vehicle downtime | 20-30% of fleet | < 8% | **↓ 73% reduction** |
| Maintenance cost overruns | 35-45% over budget | < 10% variance | **↓ 78% improvement** |
| Compliance violations (expired permits) | 12-18% of fleet | 0% (proactive alerts) | **↓ 100% elimination** |
| Insurance lapse rate | 8-15% of vehicles | 0% (30-day early warnings) | **↓ 100% elimination** |
| Dispatch assignment time | 15-45 minutes (manual) | < 3 seconds (AI auto-assign) | **↓ 99% faster** |
| Driver issue response time | 2-6 hours | < 15 minutes (SOS + ticketing) | **↓ 95% faster** |

---

## The Problem: Why Fleet Operations Fail

Fleet businesses face a compounding operational crisis:

1. **Reactive Maintenance Culture** — Vehicles break down on highways because there's no system tracking when oil changes, brake inspections, or tire rotations are due. Each breakdown costs ₹15,000–₹50,000 in towing, emergency repairs, and lost revenue.

2. **Compliance Blind Spots** — Pollution certificates, fitness certificates, national permits, state permits, goods permits, and road tax renewals each have different expiry dates. Missing even one can result in ₹10,000–₹1,00,000 fines or vehicle seizure.

3. **Insurance Gaps** — Policies expire without notice. A single accident with an uninsured vehicle exposes the business to unlimited liability.

4. **Dispatch Chaos** — Assigning the right vehicle (cargo capacity, fuel type, VIP capability) and right driver (availability, safety score, experience) to the right trip takes 30+ minutes of manual coordination.

5. **Driver Isolation** — Drivers have no visibility into their upcoming trips, vehicle health, or document status. Emergency SOS requires knowing a manager's personal phone number.

6. **Zero Audit Trail** — When things go wrong, there's no system-of-record showing who approved what, when a vehicle's status changed, or why a driver was assigned to a specific trip.

---

## How TruOps Solves It

TruOps replaces every spreadsheet, every WhatsApp group, and every paper register with a role-aware digital platform:

| Problem | TruOps Solution | Module |
|---------|----------------|--------|
| Reactive breakdowns | Preventive scheduling + component health tracking + calendar view | Maintenance Hub |
| Compliance violations | Expiry tracking with 30/7-day alerts for PUC, fitness, permits, road tax | Compliance Tracker |
| Insurance lapses | Risk-ranked fleet view + urgent renewal queue + coverage % dashboard | Insurance Intelligence |
| Slow dispatch | AI-powered auto-assignment scoring vehicles + drivers in < 3 seconds | Smart Dispatch |
| Driver isolation | Full self-service portal: trips, vehicle status, documents, SOS | Driver Portal |
| No audit trail | 500-entry ring buffer audit log with actor, entity, severity tracking | System Control |
| Manual trip booking | Gemini-powered conversational dispatch (BookSmart AI) | AI Chat |

---

## Feature Highlight: Vehicle Maintenance Scheduling & Its Business Impact

> *"Maintenance is not a cost center — it's a profit protection system."*

Vehicle maintenance scheduling is the **single highest-ROI capability** in any fleet management platform. Here's why it matters, what TruOps delivers, and how it transforms business operations.

### The Cost of Unplanned Downtime

The American Trucking Association estimates that **unplanned vehicle downtime costs fleet operators $448–$760 per vehicle per day** in lost revenue, emergency repair premiums, driver idle wages, and cascading delivery delays. For a 50-vehicle fleet operating at Indian logistics margins, even a 15% unplanned downtime rate translates to:

```
50 vehicles × 15% downtime × 365 days × ₹8,000/day lost revenue
= ₹2,19,00,000/year (≈ $26,000/year) in preventable losses
```

The root cause is almost always the same: **nobody tracked when the oil change was due, the brake pads were thinning, or the battery was degrading** — until the vehicle stopped on a national highway at 2 AM.

### Maintenance Capabilities in TruOps

TruOps delivers a **9-tab Maintenance Operations Hub** that transforms maintenance from a reactive fire-drill into a scheduled, tracked, and optimized operation:

#### 1. Work Order Management (Kanban Workflow)

Every maintenance event — whether corrective (breakdown repair) or proactive (scheduled service) — is captured as a **work order** with a 5-stage Kanban lifecycle:

```
┌──────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────┐    ┌───────────┐
│ Scheduled │ →  │ In-Service  │ →  │ Awaiting Parts  │ →  │  Ready  │ →  │ Completed │
└──────────┘    └─────────────┘    └─────────────────┘    └─────────┘    └───────────┘
```

Each work order tracks:
- **Vehicle identity** (make, model, registration)
- **Service type** (oil change, brake check, engine overhaul, etc.)
- **Priority classification** (High / Medium / Low)
- **Order type** (Corrective vs. Proactive)
- **Assigned mechanic**
- **Estimated and actual cost** (variance analysis)
- **Parts ETA** (for awaiting-parts state)
- **Odometer reading** at service time
- **Invoice generation** (invoice number, total, notes — attached to the work order)

**Business Impact:** Work orders create an auditable maintenance history per vehicle, eliminating the "who did what, when, and how much did it cost" problem. Managers see exactly which vehicles are generating the highest maintenance costs and can make data-driven fleet replacement decisions.

#### 2. Preventive Scheduling Engine

The core of proactive maintenance. Managers define recurring service schedules per vehicle:

| Service Type | Available Intervals |
|-------------|-------------------|
| Oil Change | Every X km or Y days |
| Tyre Rotation | Every X km or Y days |
| Brake Check | Every X km or Y days |
| Engine Service | Every X km or Y days |
| Filter Change | Every X km or Y days |
| Battery Check | Every X km or Y days |
| AC Service | Every X km or Y days |
| General Inspection | Every X km or Y days |

Each schedule tracks:
- `last_service_km` and `last_service_date` — when the service was last performed
- `next_due_km` and `next_due_date` — when the next service is due (auto-computed)
- `status` — Active / Upcoming / Overdue / Completed

**Business Impact:** This is the **core differentiator**. Instead of reacting to breakdowns, fleet managers see a dashboard of every upcoming service across the entire fleet. An overdue oil change costs ₹2,000. An engine seizure from missed oil changes costs ₹80,000+. Preventive scheduling provides a **40:1 cost avoidance ratio**.

#### 3. Interactive Renewal Calendar

A **full month-view calendar** that aggregates three data streams into a single visual timeline:

- **Preventive schedules** (next due dates) — displayed as blue pills
- **Compliance records** (expiry dates for PUC, fitness, permits) — displayed as amber pills
- **Active maintenance orders** (scheduled work dates) — displayed as rose pills

Each calendar cell shows:
- Colored event indicators by type
- **Vehicle count badge** — how many vehicles have events on that date
- **Click-to-expand detail drawer** — grouped by vehicle, showing every event with type, priority, status, and description

The calendar includes:
- Month navigation (previous/next) with keyboard-friendly controls
- "Today" quick-jump button
- Color-coded legend for event types
- Summary KPI bar in the detail drawer (total services, renewals, work orders, unique vehicles)

**Business Impact:** The calendar transforms maintenance planning from a reactive spreadsheet exercise into a **visual command view**. A fleet manager opening the calendar on Monday morning can see that 12 vehicles have events this week — 4 oil changes, 3 PUC renewals, 2 fitness certificate expirations, and 3 scheduled brake checks — and can allocate mechanic resources, coordinate with vendors, and pre-order parts accordingly. This **prevents scheduling collisions** (taking too many vehicles off-road simultaneously) and ensures **zero compliance lapses**.

#### 4. Vehicle Component Health Tracking

Every vehicle has 9 trackable components, each with a health percentage (0–100%):

| Component | What Degrades It | Failure Risk |
|-----------|-----------------|--------------|
| Battery | Age, extreme temperatures, frequent short trips | No-start, electrical failure |
| Brakes | Mileage, load weight, terrain | Collision risk |
| Tyres | Mileage, road quality, alignment | Blowout, fuel inefficiency |
| Engine | Oil quality, coolant levels, operating hours | Catastrophic failure |
| Transmission | Gear abuse, fluid degradation | Vehicle immobilization |
| AC | Refrigerant leaks, compressor wear | Driver discomfort, cargo damage |
| Lights | Vibration, electrical issues | Regulatory violation, accident risk |
| GPS | Firmware, antenna degradation | Tracking loss |
| Suspension | Road quality, overloading | Cargo damage, driver fatigue |

Managers update component health after inspections. The system provides a **fleet-wide health heatmap** — any component dropping below threshold triggers proactive intervention.

**Business Impact:** Component-level tracking enables **condition-based maintenance** — the gold standard in fleet management. Rather than replacing brake pads on a fixed schedule (which wastes money on vehicles with light usage), managers replace them when health drops below 30%. This **eliminates both premature replacements and catastrophic failures**.

#### 5. Service Vendor Registry

A centralized directory of external garages and service centers:
- **Name, contact person, phone, email, address, city**
- **Specialization:** General, Tyres, Engine, Electrical, Body, AC, Authorized Dealer
- **Rating:** 1.0–5.0 star system
- **Total jobs:** Historical work volume per vendor
- **Active/Inactive status**

**Business Impact:** Eliminates the "which garage do we use for AC repairs in Pune?" problem. Centralized vendor management enables **rate negotiation** (volume discounts), **quality tracking** (ratings), and **vendor diversification** (reducing dependency on any single workshop).

#### 6. Downtime Analytics

Every maintenance event generates a **downtime log** with:
- `downtime_start` and `downtime_end` timestamps
- `total_hours` — computed automatically when the vehicle returns to service
- `reason` — linked to the maintenance order description

The downtime analytics dashboard shows:
- **Average downtime per maintenance event** (industry benchmark: < 48 hours)
- **Vehicles with highest cumulative downtime** (fleet replacement candidates)
- **Downtime trend** over time (declining = improving maintenance efficiency)

**Business Impact:** Downtime is the **single most expensive metric** in fleet operations. Every hour a vehicle sits in a workshop is an hour it's not generating revenue. Downtime analytics give managers the data to answer: *"Is our maintenance getting faster? Which vendors are keeping vehicles the longest? Which vehicle models have the worst reliability?"*

#### 7. Maintenance Cost Intelligence

The cost chart aggregates actual maintenance spending across the entire fleet over 6 months, visualized as a time-series chart (powered by ApexCharts). Combined with per-order estimated vs. actual cost tracking, managers can:

- **Track maintenance budget adherence** — estimated vs. actual cost per order
- **Identify cost spikes** — sudden increases signal systematic issues (e.g., fleet aging, vendor price increases)
- **Predict annual maintenance budgets** — trend-based forecasting

**Business Impact:** Maintenance typically accounts for **15–40% of total fleet operating costs**. Cost intelligence transforms maintenance from an opaque "garage bills" expense into a **transparent, manageable budget line** with variance analysis and trend visibility.

#### 8. Driver-Initiated Issue Reporting

Drivers are the first to notice problems — a strange noise, a warning light, reduced braking power. TruOps empowers drivers to report vehicle issues directly from their mobile portal:

- Select issue priority (Low / Medium / High / Critical)
- Describe the problem
- System auto-creates a maintenance order linked to the driver's assigned vehicle
- The `reported_by_driver_id` field creates accountability and enables follow-up

**Business Impact:** This closes the **information loop** between drivers on the road and managers in the office. Without this, a driver might mention a brake issue verbally at the end of their shift — or forget entirely. With TruOps, the issue is logged instantly, triaged by priority, and appears in the maintenance queue within seconds.

### Business Impact & ROI

| Capability | Cost Without TruOps | Cost With TruOps | Annual Savings (50 vehicles) |
|-----------|---------------------|-------------------|------------------------------|
| Preventive scheduling | Emergency repairs: ₹50K–₹2L per incident | Scheduled service: ₹2K–₹15K per service | **₹25–60 lakhs/year** |
| Compliance tracking | Fines: ₹10K–₹1L per violation | Zero violations (proactive alerts) | **₹5–15 lakhs/year** |
| Downtime reduction | 20–30% fleet downtime | < 8% fleet downtime | **₹15–40 lakhs/year** |
| Component health monitoring | Catastrophic failures 3–5x/year | Near-zero catastrophic failures | **₹10–25 lakhs/year** |
| Vendor management | Untracked costs, no negotiation leverage | Volume discounts, quality tracking | **₹3–8 lakhs/year** |
| Driver issue reporting | Delayed detection (hours to days) | Instant reporting (seconds) | **Prevent 1–2 major incidents/year** |

> **Total estimated ROI for a 50-vehicle fleet: ₹58 lakhs – ₹1.48 crores per year in cost avoidance and efficiency gains.**

---

## Platform Modules

### 1. Command Dashboard (Admin)

The top-level operational overview for fleet administrators. A single screen that answers: *"What is the state of my fleet right now?"*

**Key Performance Indicators:**
- Total vehicles in fleet
- Active vehicles (on-trip or available)
- Vehicles in maintenance
- Insurance policies expiring within 7 days
- Total registered drivers
- Active trips in progress
- Pending user approval requests

**Visual Elements:**
- KPI metric cards with trend indicators
- Fleet status distribution charts (ApexCharts donut/bar)
- Glassmorphic header with real-time profile indicator

**Manager Dashboard** mirrors this with role-specific KPIs: trips completed today, fleet on-time delivery rate, pending dispatch queue depth, and vehicles currently in-service.

---

### 2. Vehicle Fleet Registry

The single source of truth for every vehicle in the fleet.

**Vehicle Data Model:**
- Registration identity: make, model, year, VIN (unique), registration number (unique), engine number
- Classification: vehicle type (Car, Truck, Bus, Van, EV, Two-wheeler) + functional category (Cargo, Passenger, VIP Transport, Standard, Emergency, Maintenance)
- Operational state: active, maintenance, blocked, on-trip
- Fuel type, fuel level, current location (GPS-updated)
- Financial: purchase date, purchase cost, warranty expiry
- Usage: mileage (km), total distance
- Documents: RC document (uploaded), RC expiry date

**Fleet Management Operations:**
- Add vehicle with document upload (RC registration, insurance policy) via multipart form
- Real-time status management (active ↔ maintenance ↔ blocked ↔ on-trip)
- VIN and registration number normalization (uppercase, trimmed, unique enforcement)
- Year validation (1900 to current+1)
- Searchable, filterable fleet table with inline action buttons
- Audit trail: every status change logged with actor identity

---

### 3. Intelligent Dispatch & Auto-Assignment

The operational nerve center for trip lifecycle management.

**Trip Lifecycle:**
```
┌─────────┐     ┌─────────┐     ┌───────────┐     ┌──────────┐
│ Pending  │ →   │ Active  │ →   │ Completed │  or │ Rejected │
└─────────┘     └─────────┘     └───────────┘     └──────────┘
```

**Trip Data Captured:**
- Route: origin, destination, distance (km)
- Cargo: type, weight, passenger count
- Priority: Standard, High, VIP, Emergency
- Classification (auto-computed): short (< 50 km), medium (< 200 km), long (< 500 km), ultra-long
- Intelligence flags: `is_long_trip` (> 200 km or > 4h travel), `vip_required` (VIP priority, 10+ passengers, VIP keywords in notes)
- Assignment: driver, vehicle, progress %, ETA, current speed
- Financial: odometer start, actual distance, trip notes

**AI Auto-Assignment Algorithm:**

TruOps implements a multi-factor scoring engine that replaces manual dispatch decisions:

```
Step 1: CLASSIFY TRIP
  ├── Analyze distance → short | medium | long | ultra-long
  ├── Detect VIP requirement → passenger count, priority, keywords
  ├── Determine cargo profile → weight, type, hazmat flags
  └── Recommend vehicle type + functional category

Step 2: SCORE AVAILABLE VEHICLES (0–100 points)
  ├── Exact vehicle type match     → +30 pts
  ├── Exact functional category    → +25 pts
  ├── Fuel level > 50%             → +5 pts
  ├── User-preferred type match    → +15 pts
  └── User-preferred category      → +10 pts

Step 3: SELECT BEST DRIVER
  ├── Prefer driver already assigned to chosen vehicle
  ├── Fallback: highest safety score among available drivers
  └── Check: no active trip conflict

Step 4: ATOMIC ASSIGNMENT
  ├── Create/update dispatch request (status → active)
  ├── Update driver profile (status → on-trip)
  └── Update vehicle (status → on-trip)
```

**Preview Mode:** Managers can preview the auto-assignment recommendation before committing — seeing the top-ranked vehicle, suggested driver, and scoring breakdown.

**Dispatch Board UI:** Kanban-style columns (Pending | Active | Completed | Rejected) with trip cards showing route, progress, ETA, priority badges, and driver/vehicle assignment.

---

### 4. Maintenance Operations Hub

*(Detailed in the [Feature Highlight section](#feature-highlight-vehicle-maintenance-scheduling--its-business-impact) above.)*

**9-Tab Interface:**
| Tab | Purpose |
|-----|---------|
| Overview | KPIs: vehicles in-service, avg downtime, monthly cost, proactive alerts |
| Work Orders | Kanban board: scheduled → in-service → awaiting-parts → ready → completed |
| Schedules | Preventive maintenance schedules (oil, brakes, tyres, engine, filters, battery, AC, inspection) |
| History | Completed maintenance records with cost analysis |
| Fleet Health | Component-level health tracking (battery, brakes, tyres, engine, transmission, AC, lights, GPS, suspension) |
| Compliance | PUC, fitness cert, national/state/goods permits, road tax expiry tracking |
| Vendors | Service center registry with specialization, rating, job count |
| Calendar | Month-view aggregated renewal calendar with click-to-expand vehicle detail |
| Analytics | 6-month cost trend chart + downtime analytics |

---

### 5. Insurance & Coverage Intelligence

**Risk Classification System:**
```
🟢 Active    — Policy valid, > 30 days remaining
🟡 Expiring  — Policy valid, 8–30 days remaining
🟠 Critical  — Policy valid, ≤ 7 days remaining
🔴 Expired   — Policy past expiry date
⚫ Uninsured — No policy on record
```

**Dashboard KPIs:**
- Total vehicles in fleet
- Fleet coverage percentage (vehicles with active policy / total vehicles)
- Expired/uninsured count
- Expiring within 7 days (urgent action required)

**Capabilities:**
- Policy CRUD with document upload (PDF)
- Urgent renewals queue (expired + expiring within 7 days)
- Upcoming renewals (next 30 days, paginated)
- Fleet insurance view: vehicle-centric table showing every asset with its latest policy status, days remaining, and risk classification
- Automatic policy ranking (latest expiry = active policy for a vehicle)

---

### 6. Driver Management

**Driver Profile Data:**
- Identity: full name, email, phone, Aadhar number
- Licensing: license number, license type (HGMV default), license expiry, medical certificate expiry
- Performance: safety score (0–100, default 100), on-time delivery rate, miles this month, total distance, total incidents, years of experience
- Operational: status (available, on-trip, off-duty), assigned vehicle
- Address

**Management Operations:**
- View all approved drivers with full profile + assigned vehicle details
- Create/update driver profiles (phone, license, experience, vehicle assignment)
- Status management (available ↔ on-trip ↔ off-duty)
- Pending driver approval (admin gate before account activation)

---

### 7. Driver Self-Service Portal

A dedicated mobile-first portal enabling drivers to manage their operational life without calling dispatch.

**Portal Sections:**

| Section | Capabilities |
|---------|-------------|
| **Dashboard** | Safety score, completed trips, total distance, on-time rate, current trip status, upcoming maintenance alerts |
| **My Trips** | Upcoming trips + history with progress tracking, trip completion workflow (final notes + odometer), raise new dispatch request |
| **Vehicle Status** | Assigned vehicle details, fuel level, insurance status, next maintenance due, component health %, compliance status |
| **Documents** | License details, Aadhar (masked), medical cert, vehicle RC, insurance policy — all with expiry warnings |
| **Support** | Emergency SOS activation (instant ticket + GPS alert), support ticket system (categories: breakdown, accident, route issue, cargo damage, payment, harassment), manager/admin contact directory |

**Emergency SOS System:**
- One-tap SOS button with pulse animation
- Auto-creates high-priority support ticket with category "Emergency SOS"
- Alerts all fleet managers and admins
- GPS location captured at trigger time

**Driver-Initiated Dispatch:**
Drivers can self-raise trip requests specifying origin, destination, and requirements — enabling on-demand logistics models alongside centrally dispatched operations.

---

### 8. Compliance & Regulatory Tracking

India's commercial vehicle regulatory landscape requires tracking multiple document types with independent expiry dates:

| Document Type | Authority | Typical Validity | Penalty for Lapse |
|--------------|-----------|-----------------|-------------------|
| Pollution Under Control (PUC) Certificate | State Pollution Board | 6 months | ₹10,000 first offense |
| Fitness Certificate | Regional Transport Office | 2 years (new), 1 year (renewal) | Vehicle seizure |
| National Permit | MoRTH | 1 year | ₹10,000–₹50,000 |
| State Permit | State Transport Authority | 1–5 years | ₹5,000–₹10,000 per state |
| Road Tax | State RTO | Annual / Lifetime | ₹5,000+ penalty |
| Goods Permit | RTO | 1–5 years | Vehicle seizure + ₹10,000 |

**TruOps Compliance Capabilities:**
- Record creation with issued date, expiry date, issuing authority, document URL upload
- Automatic expiry monitoring integrated into the maintenance calendar
- Per-vehicle compliance summary in the driver portal
- Compliance records visible in both manager and driver interfaces

---

### 9. System Administration & Audit

The sysadmin control panel provides organizational governance capabilities:

**Audit Log System:**
- 500-entry circular ring buffer (in-memory, zero-latency reads)
- Auto-logged events: `SYSTEM_START`, `VEHICLE_ADDED`, `VEHICLE_STATUS_CHANGED`, `USER_APPROVED`, `USER_REVOKED`, `TRIP_COMPLETED`, `USER_HARD_DELETED`, `USER_ROLE_CHANGED`
- Each entry captures: sequence number, timestamp, severity (info/warn/error/critical), event type, actor identity (ID, name, role), entity (type, ID, label), details text
- Filterable by: event type, severity, keyword search, date range
- Queryable limit parameter for performance

**User Lifecycle Management:**
- Full user registry (all roles)
- Hard delete with mandatory reason (for GDPR/regulatory compliance)
- Role promotion/demotion (driver ↔ manager ↔ admin)
- Approval toggle (grant/revoke access without deletion)

**System Health Monitoring:**
- Database table row counts (capacity planning)
- Fleet activity feed (recent vehicles added, trips completed, maintenance events)
- Overview dashboard (aggregate counts: users, vehicles, trips, insurance, support tickets, audit entries)

---

### 10. BookSmart AI — Conversational Dispatch

An AI-powered trip booking assistant built on **Google Gemini 2.5 Flash Lite** that transforms natural conversation into structured dispatch requests.

**Conversation Flow:**
```
BookSmart: "Where are you shipping from?"
User:      "Mumbai warehouse"
BookSmart: "Where should it go?"
User:      "Pune central depot"
BookSmart: "How urgent is this? Standard or rush?"
User:      "It's a VIP client, needs premium handling"
BookSmart: "What are you moving — cargo or passengers?"
User:      "Executive team, 4 people"
```

**Intelligence Layer:**
- Keyword detection: "urgent" → emergency priority; "VIP/premium/executive" → VIP priority; "willing to pay more" → high priority
- Vehicle recommendation: VIP → Car/VIP Transport; 10+ passengers → Bus/Passenger; cargo mentioned → Truck/Cargo; heavy/hazardous → Truck/Cargo
- Outputs structured `[FORM_DATA]` JSON alongside conversational reply
- Safety guardrails: `BLOCK_MEDIUM_AND_ABOVE` on all harm categories

---

## Role-Based Access Architecture

TruOps implements a three-tier role hierarchy with strict access boundaries:

```
┌────────────────────────────────────────────────────────────┐
│                        ADMIN                                │
│  Full platform access + user management + system control    │
│                                                             │
│  Modules: Dashboard, Vehicles, Drivers, Dispatch,           │
│  Insurance, Maintenance, User Approval, System Control,     │
│  Settings, BookSmart AI                                     │
├────────────────────────────────────────────────────────────┤
│                       MANAGER                               │
│  Fleet operations + maintenance + dispatch (no user mgmt)   │
│                                                             │
│  Modules: Dashboard, Fleet View, Drivers, Dispatch,         │
│  Maintenance Hub, BookSmart AI                              │
├────────────────────────────────────────────────────────────┤
│                        DRIVER                               │
│  Self-service portal only (own data)                        │
│                                                             │
│  Modules: Dashboard, My Trips, Vehicle Status,              │
│  Documents, Support & SOS, BookSmart AI                     │
└────────────────────────────────────────────────────────────┘
```

**Approval Gate:** New user registrations (except the first admin) require admin approval before account activation. This prevents unauthorized access while maintaining a self-service signup flow.

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│                                                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
│  │   Admin   │  │  Manager  │  │  Driver   │  │ BookSmart AI │ │
│  │  Portal   │  │  Portal   │  │  Portal   │  │   (Chat UI)  │ │
│  │ (7 pages) │  │ (5 pages) │  │ (5 pages) │  │              │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
│        │              │              │               │          │
│        └──────────────┼──────────────┼───────────────┘          │
│                       │              │                           │
│              ┌────────▼──────────────▼────────┐                 │
│              │    REST API (HTTPS/JSON)        │                 │
│              │    + Socket.IO (WebSocket)      │                 │
│              └────────────────┬────────────────┘                 │
└───────────────────────────────┼──────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│                     APPLICATION LAYER                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Express.js Server                         │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │ │
│  │  │  CORS    │  │ JSON Parser  │  │   Static File Server  │ │ │
│  │  └──────────┘  └──────────────┘  └───────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │              MIDDLEWARE PIPELINE                       │   │ │
│  │  │  ┌──────────────┐    ┌────────────────────┐          │   │ │
│  │  │  │ authenticate │ →  │ authorize(roles[]) │          │   │ │
│  │  │  │ (JWT verify) │    │ (role gate)        │          │   │ │
│  │  │  └──────────────┘    └────────────────────┘          │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │                  ROUTE MODULES (11)                    │   │ │
│  │  │  auth · users · vehicles · insurance · dashboard      │   │ │
│  │  │  drivers · dispatch · manager · driver_portal         │   │ │
│  │  │  sysadmin · ai                                        │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │              CONTROLLER LAYER (10)                     │   │ │
│  │  │  100+ exported functions handling business logic       │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────┐   ┌────────────┐   ┌─────────────────────────┐  │
│  │ Socket.IO  │   │   Multer   │   │   Gemini AI Client      │  │
│  │ (Realtime) │   │ (Uploads)  │   │ (gemini-2.5-flash-lite) │  │
│  └────────────┘   └────────────┘   └─────────────────────────┘  │
└───────────────────────────────────────┬──────────────────────────┘
                                        │
┌───────────────────────────────────────▼──────────────────────────┐
│                       DATA LAYER                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Platform                         │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌─────────────────┐  ┌──────────────────┐ │ │
│  │  │ PostgreSQL │  │ Storage Buckets │  │  Auth (bypassed; │ │ │
│  │  │ (12 tables)│  │ fleet-documents │  │  custom JWT)     │ │ │
│  │  └────────────┘  └─────────────────┘  └──────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20 LTS | Server-side JavaScript execution |
| **Framework** | Express.js 4.18 | HTTP routing, middleware pipeline, static file serving |
| **Database** | Supabase (PostgreSQL) | Relational data storage, real-time subscriptions, file storage |
| **Authentication** | JSON Web Tokens (jsonwebtoken 9.x) | Stateless authentication with 8-hour token expiry |
| **Password Security** | bcryptjs 2.4 | Bcrypt hashing with salt factor 10 |
| **File Uploads** | Multer 2.1 | Multipart form data handling (RC documents, insurance PDFs) |
| **Real-Time** | Socket.IO 4.8 | WebSocket-based live tracking and event broadcasting |
| **AI** | Google Gemini 2.5 Flash Lite | Conversational dispatch assistant (BookSmart) |
| **Hosting** | Firebase Hosting + Cloud Functions v2 | CDN-backed static delivery + serverless API |
| **Region** | asia-south1 (Mumbai) | Low-latency for India-based fleet operations |
| **Charts** | ApexCharts | Interactive data visualization (donut, line, bar, area) |
| **PDF Generation** | jsPDF | Client-side invoice and report PDF generation |
| **Icons** | Font Awesome 6.4 | UI iconography system |
| **Typography** | Google Fonts (Inter + Outfit) | Modern, readable interface typography |

### Database Schema

**12 tables** powering the entire platform:

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                           │
│                                                                   │
│  ┌─────────┐ 1   1 ┌─────────────────┐                          │
│  │  users  │───────│ driver_profiles  │                          │
│  │         │       │                  │                          │
│  │ id (PK) │       │ user_id (FK)     │                          │
│  │ email   │       │ license_number   │                          │
│  │ role    │       │ safety_score     │                          │
│  │ approved│       │ assigned_vehicle │──┐                       │
│  └────┬────┘       └─────────────────┘  │                       │
│       │                                   │                       │
│       │ 1                                 │                       │
│       │     ┌──────────────────┐          │                       │
│       ├────→│ support_tickets  │          │                       │
│       │  ∞  │ category, status │          │                       │
│       │     └──────────────────┘          │                       │
│       │                                   │                       │
│       │     ┌──────────────────┐    ┌─────▼──────┐               │
│       └────→│dispatch_requests │───→│  vehicles   │               │
│          ∞  │ origin,dest      │ ∞  │             │               │
│             │ priority,status  │    │ id (PK)     │               │
│             │ driver_id (FK)   │    │ VIN (UQ)    │               │
│             │ vehicle_id (FK)  │    │ reg_no (UQ) │               │
│             └──────────────────┘    │ status      │               │
│                                      │ type,cat    │               │
│              ┌───────────────────────┤ mileage     │               │
│              │                       └──────┬──────┘               │
│              │                              │ 1                    │
│         ┌────▼──────────────┐               │                     │
│         │ maintenance_orders│    ┌──────────┼──────────┐          │
│         │ title, priority   │    │          │          │          │
│         │ status (kanban)   │    │          │          │          │
│         │ est/act cost      │    ▼ ∞       ▼ ∞       ▼ ∞        │
│         │ mechanic_name     │ ┌────────┐┌────────┐┌──────────┐  │
│         │ invoice_*         │ │insuranc││prevent.││compliance│  │
│         └────────┬──────────┘ │policies││schedule││ records  │  │
│                  │            │provider││svc_type││rec_type  │  │
│                  │            │expiry  ││next_due││expiry    │  │
│                  ▼ 1          └────────┘└────────┘└──────────┘  │
│         ┌────────────────┐                                       │
│         │ downtime_logs  │    ┌──────────────────┐               │
│         │ start, end     │    │vehicle_components│               │
│         │ total_hours    │    │ component_name   │ ← per vehicle │
│         └────────────────┘    │ health_pct (0-100│               │
│                               └──────────────────┘               │
│         ┌────────────────┐                                       │
│         │service_vendors │    Standalone entity                   │
│         │ specialization │    (linked by business logic)          │
│         │ rating, jobs   │                                       │
│         └────────────────┘                                       │
└──────────────────────────────────────────────────────────────────┘
```

**Table Summary:**

| Table | Records | Primary Key | Foreign Keys | Purpose |
|-------|---------|-------------|-------------|---------|
| `users` | All accounts | UUID | — | Identity + auth + role |
| `driver_profiles` | Driver extensions | UUID | users.id, vehicles.id | License, safety, assignment |
| `vehicles` | Fleet registry | UUID | — | Every vehicle in the fleet |
| `insurance_policies` | Coverage records | UUID | vehicles.id (CASCADE) | Insurance tracking |
| `dispatch_requests` | Trip lifecycle | UUID | users.id, vehicles.id | Dispatch + tracking |
| `maintenance_orders` | Work orders | UUID | vehicles.id | Maintenance workflow |
| `preventive_schedules` | Service schedules | UUID | vehicles.id | Proactive maintenance |
| `vehicle_components` | Health tracking | UUID | vehicles.id (UNIQUE composite) | Component-level health |
| `compliance_records` | Regulatory docs | UUID | vehicles.id | PUC, fitness, permits |
| `vehicle_downtime_logs` | Downtime tracking | UUID | vehicles.id, maintenance_orders.id | Availability analytics |
| `service_vendors` | Garage registry | UUID | — | Vendor management |
| `support_tickets` | Help desk | UUID | users.id | Driver support + SOS |

### API Reference

**Base URL:** `/api`

#### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | Public | Register new user account |
| POST | `/auth/login` | Public | Authenticate and receive JWT |

#### User Management (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/pending` | Admin | List unapproved signups |
| GET | `/users/approved` | Admin | List active users |
| PUT | `/users/approve/:userId` | Admin | Approve user registration |
| DELETE | `/users/reject/:userId` | Admin | Reject and delete signup |
| PUT | `/users/profile` | Any | Update own profile (name, avatar) |
| PUT | `/users/password` | Any | Change password (requires current) |

#### Vehicle Fleet (`/api/vehicles`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vehicles` | Admin, Manager | List all vehicles with insurance |
| GET | `/vehicles/:vehicleId` | Admin, Manager | Single vehicle detail |
| POST | `/vehicles` | Admin | Add vehicle (multipart: RC + insurance docs) |
| PUT | `/vehicles/:vehicleId/status` | Admin, Manager | Change vehicle status |
| PUT | `/vehicles/:vehicleId` | Admin | Update vehicle details |
| DELETE | `/vehicles/:vehicleId` | Admin | Decommission vehicle |

#### Insurance (`/api/insurance`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/insurance` | Admin, Manager | All policies with vehicle data |
| GET | `/insurance/stats` | Admin, Manager | Coverage KPIs |
| GET | `/insurance/urgent` | Admin, Manager | Expired + expiring within 7 days |
| GET | `/insurance/upcoming` | Admin, Manager | Next 30-day renewals |
| GET | `/insurance/fleet-view` | Admin, Manager | Vehicle-centric insurance view |
| POST | `/insurance` | Admin | Add policy (multipart: document) |
| PUT | `/insurance/:policyId` | Admin | Update/renew policy |
| DELETE | `/insurance/:policyId` | Admin | Remove policy |

#### Dashboard (`/api/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | Admin, Manager | Aggregated fleet KPIs |

#### Driver Management (`/api/drivers`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/drivers` | Admin, Manager | All drivers with profiles |
| GET | `/drivers/stats` | Admin, Manager | Driver count statistics |
| GET | `/drivers/:driverId` | Admin, Manager | Single driver detail |
| PUT | `/drivers/:driverId/profile` | Admin | Create/update driver profile |
| PUT | `/drivers/:driverId/status` | Admin, Manager | Change driver availability |

#### Dispatch Operations (`/api/dispatch`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dispatch/stats` | Admin, Manager | Dispatch queue KPIs |
| GET | `/dispatch/pending` | Admin, Manager | Unassigned trips |
| GET | `/dispatch/active` | Admin, Manager | In-progress trips |
| GET | `/dispatch/history` | Admin, Manager | Completed/rejected trips |
| POST | `/dispatch` | Admin, Manager | Create trip request |
| PUT | `/dispatch/approve/:requestId` | Admin, Manager | Assign driver + vehicle |
| PUT | `/dispatch/complete/:requestId` | Admin, Manager | Mark trip completed |
| DELETE | `/dispatch/reject/:requestId` | Admin, Manager | Cancel/reject trip |
| POST | `/dispatch/auto-assign` | Admin, Manager | AI auto-assignment |
| GET | `/dispatch/preview-assign` | Admin, Manager | Preview assignment without committing |
| POST | `/dispatch/location` | API Key | GPS location update |
| GET | `/dispatch/live-locations` | Admin, Manager | Active driver positions |

#### Manager Operations (`/api/manager`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/manager/dashboard-stats` | Admin, Manager | Manager-specific KPIs |
| GET | `/manager/fleet-summary` | Admin, Manager | Fleet status distribution |
| GET | `/manager/fleet` | Admin, Manager | Full fleet with computed status |
| GET | `/manager/maintenance` | Admin, Manager | Work orders (filterable) |
| GET | `/manager/maintenance/stats` | Admin, Manager | Maintenance KPIs |
| GET | `/manager/maintenance/cost-chart` | Admin, Manager | 6-month cost trend data |
| POST | `/manager/maintenance` | Admin, Manager | Create work order |
| PATCH | `/manager/maintenance/:orderId/status` | Admin, Manager | Advance Kanban state |
| GET | `/manager/maintenance/proactive` | Admin, Manager | Upcoming preventive services |
| GET | `/manager/activity` | Admin, Manager | Recent dispatch activity feed |
| GET | `/manager/maintenance/alerts` | Admin, Manager | Active maintenance alerts |
| GET | `/manager/maintenance/history` | Admin, Manager | Past maintenance records |
| GET | `/manager/maintenance/schedules` | Admin, Manager | Preventive schedules |
| POST | `/manager/maintenance/schedules` | Admin, Manager | Create preventive schedule |
| DELETE | `/manager/maintenance/schedules/:id` | Admin, Manager | Remove schedule |
| GET | `/manager/maintenance/components/:vehicleId` | Admin, Manager | Vehicle component health |
| POST | `/manager/maintenance/components/:vehicleId` | Admin, Manager | Update component health |
| GET | `/manager/maintenance/components` | Admin, Manager | Fleet-wide component health |
| GET | `/manager/maintenance/compliance` | Admin, Manager | Compliance records |
| POST | `/manager/maintenance/compliance` | Admin, Manager | Create compliance record |
| DELETE | `/manager/maintenance/compliance/:id` | Admin, Manager | Remove compliance record |
| GET | `/manager/maintenance/vendors` | Admin, Manager | Service vendor registry |
| POST | `/manager/maintenance/vendors` | Admin, Manager | Add vendor |
| DELETE | `/manager/maintenance/vendors/:id` | Admin, Manager | Deactivate vendor |
| GET | `/manager/maintenance/downtime` | Admin, Manager | Downtime analytics |
| GET | `/manager/maintenance/calendar` | Admin, Manager | Aggregated maintenance calendar |
| GET | `/manager/maintenance/:orderId` | Admin, Manager | Single work order detail |
| PATCH | `/manager/maintenance/:orderId/invoice` | Admin, Manager | Save invoice to work order |

#### Driver Portal (`/api/driver`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/driver/me` | Driver, Admin, Manager | Own profile + vehicle |
| GET | `/driver/current-trip` | Driver, Admin, Manager | Active/pending trip |
| GET | `/driver/trips/stats` | Driver, Admin, Manager | Personal trip statistics |
| GET | `/driver/trips` | Driver, Admin, Manager | Trip list (?view=upcoming\|history) |
| PUT | `/driver/trips/:tripId/complete` | Driver, Admin, Manager | Complete trip |
| GET | `/driver/vehicle` | Driver, Admin, Manager | Assigned vehicle detail |
| POST | `/driver/vehicle/issue` | Driver, Admin, Manager | Report vehicle issue |
| GET | `/driver/vehicle/maintenance-history` | Driver, Admin, Manager | Vehicle maintenance log |
| GET | `/driver/vehicle-lookup` | Driver, Admin, Manager | Search vehicle by plate |
| GET | `/driver/available-vehicles` | Driver, Admin, Manager | Available vehicles list |
| POST | `/driver/dispatch` | Driver, Admin, Manager | Self-raise dispatch request |
| GET | `/driver/documents` | Driver, Admin, Manager | Personal + vehicle documents |
| GET | `/driver/support/contacts` | Driver, Admin, Manager | Manager/admin directory |
| GET | `/driver/support/tickets` | Driver, Admin, Manager | Own support tickets |
| POST | `/driver/support/tickets` | Driver, Admin, Manager | Create support ticket |
| POST | `/driver/sos` | Driver, Admin, Manager | Emergency SOS activation |
| GET | `/driver/maintenance/orders` | Driver, Admin, Manager | Open maintenance orders |
| GET | `/driver/maintenance/schedule` | Driver, Admin, Manager | Upcoming service schedule |

#### System Administration (`/api/sysadmin`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sysadmin/overview` | Admin | System-wide entity counts |
| GET | `/sysadmin/audit-log` | Admin | Searchable audit log |
| GET | `/sysadmin/users` | Admin | Full user registry |
| DELETE | `/sysadmin/users/:userId` | Admin | Hard delete (with reason) |
| PUT | `/sysadmin/users/:userId/role` | Admin | Change user role |
| PUT | `/sysadmin/users/:userId/approval` | Admin | Toggle user approval |
| GET | `/sysadmin/db-stats` | Admin | Database table statistics |
| GET | `/sysadmin/fleet-activity` | Admin | Recent fleet activity |

#### AI Assistant (`/api/ai`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/greeting` | Any | BookSmart greeting message |
| POST | `/ai/chat` | Any | Conversational dispatch via Gemini |

### Authentication & Authorization

**Token Lifecycle:**
```
1. POST /api/auth/login → { email, password }
2. Server: bcrypt.compare(password, stored_hash)
3. Server: jwt.sign({ id, role, email, full_name }, JWT_SECRET, { expiresIn: '8h' })
4. Client: stores token in localStorage as 'trufleet_token'
5. Subsequent requests: Authorization: Bearer <token>
6. Middleware: jwt.verify(token, JWT_SECRET) → req.user = { id, role, email, full_name }
7. authorize(...roles): checks req.user.role ∈ allowed roles → 403 if denied
```

**Security Characteristics:**
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT expiry: 8 hours (forces daily re-authentication)
- Role-based access control at the route level (not database level)
- Supabase RLS disabled — all security enforced in Express middleware
- Service role key used server-side to bypass Supabase RLS

### Real-Time Architecture

TruOps includes a Socket.IO integration layer for real-time fleet tracking:

```
Client (Browser) ←→ Socket.IO Server (WebSocket)
                         │
                         ├── connection event logging
                         ├── disconnect event logging
                         └── GPS location broadcast (via /dispatch/location API)
```

The architecture supports:
- Live vehicle position updates on dispatch maps
- Real-time trip progress monitoring
- Connection presence tracking (driver online/offline status)

---

## Security Architecture

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| **Transport** | HTTPS (enforced by Firebase Hosting) | TLS termination at CDN edge |
| **Authentication** | JWT Bearer tokens | 8-hour expiry, server-side verification |
| **Authorization** | Role-based middleware | `authorize('admin', 'manager')` per route |
| **Password Storage** | bcryptjs (salt=10) | Industry-standard adaptive hashing |
| **API Security** | GPS location endpoint uses API key validation | Prevents unauthorized location injection |
| **File Upload** | Multer with field-name whitelisting | Only `rc_document`, `insurance_document`, `policy_document` accepted |
| **Clickjacking Protection** | `X-Frame-Options: DENY` | Prevents iframe embedding |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | Prevents browser MIME-type guessing |
| **Referrer Policy** | `strict-origin-when-cross-origin` | Controls referrer header leakage |
| **Cache Control** | HTML: `no-cache`; Assets: 1-year immutable | Prevents stale auth pages; enables CDN caching for static assets |
| **Approval Gate** | New users require admin approval | Prevents unauthorized fleet access |
| **Audit Trail** | Ring buffer audit log (500 entries) | Actor, entity, severity, timestamp for every system event |

---

## Deployment Architecture

TruOps supports multiple deployment targets:

### Firebase (Primary — Production)

```
Firebase Hosting (Global CDN)
  ├── Static files: server/public/* (HTML, CSS, JS)
  ├── Security headers (X-Frame-Options, nosniff, referrer-policy)
  ├── Cache: HTML no-cache, assets 1-year
  └── Rewrite: /api/** → Cloud Functions

Firebase Cloud Functions v2
  ├── Region: asia-south1 (Mumbai)
  ├── Runtime: Node.js 20
  ├── Memory: 512 MiB
  ├── Timeout: 60 seconds
  ├── Min instances: 0 (scale-to-zero)
  └── Entry: index.js → exports.api = onRequest(expressApp)
```

### Platform-as-a-Service (Alternative)

The `Procfile` enables deployment to Heroku, Railway, Render, or any PaaS:
```
web: cd server && node server.js
```

### Firebase App Hosting (Alternative)

The `apphosting.yaml` enables Firebase App Hosting:
```yaml
runtime: nodejs20
startCommand: npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service_role key (bypasses RLS) |
| `JWT_SECRET` | Yes | Secret key for JWT signing/verification |
| `GEMINI_API_KEY` | For AI | Google Gemini API key (BookSmart chat) |
| `PORT` | No | Server port (default: 3000) |

---

## Project Structure

```
TruMove/
│
├── README.md                          # This documentation
├── package.json                       # Root package (orchestrates server install + start)
├── firebase.json                      # Firebase Hosting + Functions configuration
├── apphosting.yaml                    # Firebase App Hosting configuration
├── Procfile                           # PaaS deployment command
│
└── server/                            # Application server
    ├── package.json                   # Server dependencies
    ├── index.js                       # Firebase Cloud Functions v2 entry point
    ├── server.js                      # Express application + Socket.IO server
    ├── schema.sql                     # Complete database schema (12 tables)
    │
    ├── config/
    │   └── supabaseClient.js          # Supabase client initialization
    │
    ├── middleware/
    │   └── auth.middleware.js          # JWT authentication + role authorization
    │
    ├── controllers/                   # Business logic layer (100+ exported functions)
    │   ├── auth.controller.js         # Signup + login
    │   ├── user.controller.js         # User approval + profile management
    │   ├── vehicle.controller.js      # Fleet CRUD + document upload
    │   ├── insurance.controller.js    # Policy management + risk intelligence
    │   ├── dashboard.controller.js    # Aggregated KPIs
    │   ├── driver.controller.js       # Driver profile management
    │   ├── dispatch.controller.js     # Trip lifecycle + auto-assignment AI
    │   ├── manager.controller.js      # Maintenance hub + fleet operations
    │   ├── driver_portal.controller.js # Driver self-service (17 endpoints)
    │   └── sysadmin.controller.js     # Audit log + system administration
    │
    ├── routes/                        # Route definitions (11 modules)
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── vehicle.routes.js
    │   ├── insurance.routes.js
    │   ├── dashboard.routes.js
    │   ├── driver.routes.js
    │   ├── dispatch.routes.js
    │   ├── manager.routes.js
    │   ├── driver_portal.routes.js
    │   └── sysadmin.routes.js
    │
    └── public/                        # Frontend (static HTML + inline CSS/JS)
        ├── home.html                  # Landing page (hero + features + CTA)
        ├── login.html                 # Authentication gateway
        ├── signup.html                # Registration form
        │
        ├── Dasboard_admin.html        # Admin command dashboard
        ├── Vehicle_Management_admin.html  # Fleet registry
        ├── Driver_management_admin.html   # Driver management
        ├── Dispatch_Control_admin.html    # Dispatch board + auto-assign
        ├── Insurance_admin.html           # Coverage intelligence
        ├── User_Approval_admin.html       # User onboarding gate
        ├── System_Control_admin.html      # Audit log + system admin
        ├── Setting_admin.html             # Platform settings
        │
        ├── Dashboard_manager.html         # Manager operations dashboard
        ├── Drivers_manager.html           # Manager driver view
        ├── View_fleet_manager.html        # Manager fleet view
        │
        ├── manager/
        │   ├── Dashboard_manager.html     # Manager dashboard (alt path)
        │   ├── Maintenance_manager.html   # 9-tab Maintenance Operations Hub
        │   ├── Drivers_manager.html       # Manager driver management
        │   └── View_fleet_manager.html    # Manager fleet overview
        │
        └── driver/
            ├── dashboard_driver.html      # Driver mission control
            ├── MyTrips_driver.html         # Trip log + completion workflow
            ├── Vehicle_status_driver.html  # Assigned vehicle health
            ├── Documents_driver.html       # Document vault
            └── support_driver.html         # Support + Emergency SOS
```

---

## Getting Started

### Prerequisites

- **Node.js 20.x** or higher
- **npm** (included with Node.js)
- **Supabase project** (free tier sufficient for development)
- **Google Gemini API key** (optional, for BookSmart AI chat)

### Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key
JWT_SECRET=your-secure-random-string-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

> **Important:** Use the Supabase **service_role** key (not the anon key). This key bypasses Row Level Security, as TruOps enforces access control at the Express middleware layer.

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TruMove

# Install all dependencies (root + server)
npm install
```

The root `postinstall` script automatically runs `cd server && npm install` to install server dependencies.

### Database Setup

1. Navigate to your Supabase project dashboard → **SQL Editor**
2. Copy the contents of `server/schema.sql`
3. Execute the SQL to create all 12 tables

The schema creates tables with appropriate constraints, foreign keys, unique indexes, and default values. RLS is explicitly disabled on all tables (access control is handled by Express middleware).

### Running Locally

```bash
# Development mode (with auto-reload via nodemon)
npm run dev

# Production mode
npm start
```

The server starts on `http://localhost:3000`. Navigate to:
- **Landing page:** `http://localhost:3000`
- **Login:** `http://localhost:3000/login.html`
- **Admin dashboard:** `http://localhost:3000/Dasboard_admin.html`
- **Maintenance hub:** `http://localhost:3000/manager/Maintenance_manager.html`
- **Driver portal:** `http://localhost:3000/driver/dashboard_driver.html`

### Deploying to Production

#### Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select Hosting + Functions)
firebase init

# Deploy
firebase deploy
```

Firebase Hosting serves static files with CDN caching, and `/api/**` routes are rewritten to the Cloud Functions v2 backend running in `asia-south1` (Mumbai).

#### PaaS Deployment (Heroku, Railway, Render)

The `Procfile` provides the start command:
```
web: cd server && node server.js
```

Set environment variables via the platform's dashboard or CLI, then deploy via Git push.

---

## Industry Context & Competitive Positioning

### Market Landscape

The fleet management software market is dominated by enterprise players priced at **$15–$50 per vehicle per month**:

| Platform | Focus Area | Gap TruOps Fills |
|----------|-----------|------------------|
| Samsara | GPS + telematics hardware | Requires proprietary hardware; TruOps is hardware-agnostic |
| Fleetio | Maintenance + fuel | No intelligent dispatch; no driver self-service portal |
| Motive (KeepTruckin) | ELD compliance (US-focused) | No Indian regulatory compliance (PUC, fitness, permits) |
| Teletrac Navman | Enterprise tracking | Priced out of reach for SME fleets (< 100 vehicles) |
| Verizon Connect | IoT + analytics | Complex integration; months of implementation |

### TruOps Differentiators

1. **India-First Compliance Engine** — PUC certificates, fitness certificates, national/state/goods permits, road tax — tracked with authority names and document uploads. No other platform covers India's RTO regulatory framework natively.

2. **AI-Powered Dispatch** — Multi-factor scoring engine (vehicle type match, functional category, fuel level, driver safety score) replaces manual assignment. Preview mode enables human-in-the-loop validation.

3. **Conversational Trip Booking (BookSmart)** — Gemini-powered natural language dispatch. No training required — users describe trips in plain language and the AI extracts structured form data.

4. **Driver Self-Service + Emergency SOS** — Drivers are not second-class citizens. They have their own portal with trip management, document access, vehicle health visibility, and one-tap emergency alerts.

5. **Component-Level Health Tracking** — 9 trackable components per vehicle with health percentages. Enables condition-based maintenance — the industry's transition from time-based to predictive maintenance.

6. **Zero Hardware Dependency** — Pure software platform. Works with any GPS provider, any vehicle, any fleet size. No OBD-II dongle, no proprietary sensor, no installation appointment.

7. **Serverless, Scale-to-Zero Economics** — Firebase Cloud Functions v2 with `minInstances: 0` means zero cost during off-hours. A 50-vehicle fleet pays only for actual API usage, not idle servers.

### Industry Standards Alignment

| Standard/Practice | TruOps Implementation |
|-------------------|----------------------|
| **ISO 55000** (Asset Management) | Full asset lifecycle: registration → operation → maintenance → decommission |
| **FMCSA Compliance** (Fleet Safety) | Safety score tracking, driver qualification files, medical cert expiry |
| **OSHA Fleet Safety** | Preventive maintenance scheduling, component health monitoring |
| **India MoRTH Regulations** | PUC, fitness, permit, road tax expiry tracking with document management |
| **SAE J1939** (Vehicle Diagnostics) | Component health tracking framework (extensible to OBD-II integration) |
| **SOC 2 Readiness** | Audit log, role-based access, approval gates, password hashing |

---

## Roadmap

| Phase | Capabilities | Status |
|-------|-------------|--------|
| **v1.0 — Foundation** | Auth, vehicles, drivers, dispatch, insurance, dashboard | ✅ Shipped |
| **v1.1 — Maintenance Intelligence** | Work orders, Kanban, preventive scheduling, calendar, components, vendors, compliance, cost analytics, downtime tracking | ✅ Shipped |
| **v1.2 — Driver Empowerment** | Driver portal, self-service trips, document vault, SOS, support tickets | ✅ Shipped |
| **v1.3 — AI Integration** | BookSmart conversational dispatch, trip classification, auto-assignment | ✅ Shipped |
| **v2.0 — Predictive Analytics** | ML-based failure prediction, fuel consumption optimization, route optimization | 🔮 Planned |
| **v2.1 — Mobile Native** | React Native driver app, push notifications, offline trip logging | 🔮 Planned |
| **v2.2 — OBD-II Integration** | Real-time engine diagnostics, automatic component health updates, DTC code parsing | 🔮 Planned |
| **v2.3 — Financial Module** | Fuel card integration, automated invoicing, P&L per vehicle/route | 🔮 Planned |
| **v2.4 — Multi-Tenant** | Organization-level isolation, white-label deployment, SSO integration | 🔮 Planned |

---

<p align="center">
  <strong>TruOps by TruFleet</strong> — Intelligent Fleet Operations for the Modern Logistics Enterprise
  <br/>
  <sub>Built with precision. Deployed with confidence. Operated with intelligence.</sub>
</p>
