const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/manager.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All manager routes require: valid JWT + role of 'manager' or 'admin'
const guard = [authenticate, authorize('admin', 'manager')];

// ── DASHBOARD ────────────────────────────────────────────────────────────────
// @route  GET /api/manager/dashboard-stats
// @desc   KPIs: trips today, on-time rate, pending dispatch, vehicles in maintenance
router.get('/dashboard-stats', guard, ctrl.getDashboardStats);

// @route  GET /api/manager/fleet-summary
// @desc   Counts: onRoad / idle / maintenance  →  feeds ApexCharts donut
router.get('/fleet-summary', guard, ctrl.getFleetSummary);

// ── FLEET VIEW ────────────────────────────────────────────────────────────────
// @route  GET /api/manager/fleet
// @desc   All vehicles with computed_status + current trip + assigned driver
router.get('/fleet', guard, ctrl.getManagerFleet);

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
// @route  GET /api/manager/maintenance
// @desc   All work orders; optional ?status=  ?order_type=
router.get('/maintenance', guard, ctrl.getMaintenanceOrders);

// @route  GET /api/manager/maintenance/stats
// @desc   KPIs: vehicles in service, avg downtime, month cost
router.get('/maintenance/stats', guard, ctrl.getMaintenanceStats);

// @route  GET /api/manager/maintenance/cost-chart
// @desc   Last 6 months maintenance cost data for ApexCharts
router.get('/maintenance/cost-chart', guard, ctrl.getMaintenanceCostChart);

// @route  GET /api/manager/maintenance/proactive
// @desc   Upcoming proactive service orders
router.get('/maintenance/proactive', guard, ctrl.getProactiveMaintenance);

// @route  POST /api/manager/maintenance
// @desc   Create a new maintenance work order
router.post('/maintenance', guard, ctrl.createMaintenanceOrder);

// @route  PATCH /api/manager/maintenance/:orderId/status
// @desc   Update Kanban status of a work order
router.patch('/maintenance/:orderId/status', guard, ctrl.updateOrderStatus);

// ── ACTIVITY FEED ─────────────────────────────────────────────────────────────
// @route  GET /api/manager/activity
// @desc   Recent dispatch activity events for the live feed panel
router.get('/activity', guard, ctrl.getActivityFeed);

// ── MAINTENANCE EXTENDED — Alerts, History, Schedules, Components ────────────
router.get('/maintenance/alerts',                   guard, ctrl.getMaintenanceAlerts);
router.get('/maintenance/history',                  guard, ctrl.getServiceHistory);

// Preventive schedules
router.get('/maintenance/schedules',                guard, ctrl.getPreventiveSchedules);
router.post('/maintenance/schedules',               guard, ctrl.createPreventiveSchedule);
router.patch('/maintenance/schedules/:scheduleId/complete', guard, ctrl.completePreventiveSchedule);
router.delete('/maintenance/schedules/:scheduleId', guard, ctrl.deletePreventiveSchedule);

// Vehicle components
router.get('/maintenance/components/:vehicle_id',   guard, ctrl.getVehicleComponents);
router.post('/maintenance/components/:vehicle_id',  guard, ctrl.upsertVehicleComponent);
router.get('/maintenance/components',               guard, ctrl.getAllComponents);

// Compliance records
router.get('/maintenance/compliance',               guard, ctrl.getComplianceRecords);
router.post('/maintenance/compliance',              guard, ctrl.createComplianceRecord);
router.delete('/maintenance/compliance/:recordId',  guard, ctrl.deleteComplianceRecord);

// Service vendors
router.get('/maintenance/vendors',                  guard, ctrl.getVendors);
router.post('/maintenance/vendors',                 guard, ctrl.createVendor);
router.delete('/maintenance/vendors/:vendorId',     guard, ctrl.deleteVendor);

// Downtime stats
router.get('/maintenance/downtime',                 guard, ctrl.getDowntimeStats);

// Calendar events aggregation
router.get('/maintenance/calendar',                 guard, ctrl.getCalendarEvents);

// ── SUPPORT TICKETS ──────────────────────────────────────────────────────────
router.get('/tickets',              guard, ctrl.getAllTickets);
router.get('/tickets/stats',        guard, ctrl.getTicketStats);
router.patch('/tickets/:ticketId',  guard, ctrl.updateTicket);

// Single order (for invoice modal pre-fill) — must come AFTER all specific named routes
router.get('/maintenance/:orderId',                 guard, ctrl.getOrderById);

// Invoice save
router.patch('/maintenance/:orderId/invoice',       guard, ctrl.saveOrderInvoice);

module.exports = router;
