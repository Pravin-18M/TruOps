const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatch.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/dispatch/stats
// @desc    Get pending, active, critical counts
// @access  Private (admin, manager)
router.get('/stats', authenticate, authorize('admin', 'manager'), dispatchController.getDispatchStats);

// @route   GET /api/dispatch/pending
// @desc    Get all pending dispatch requests
// @access  Private (admin, manager)
router.get('/pending', authenticate, authorize('admin', 'manager'), dispatchController.getPendingRequests);

// @route   GET /api/dispatch/active
// @desc    Get all active trips
// @access  Private (admin, manager)
router.get('/active', authenticate, authorize('admin', 'manager'), dispatchController.getActiveTrips);

// @route   GET /api/dispatch/history
// @desc    Get completed/rejected trips
// @access  Private (admin, manager)
router.get('/history', authenticate, authorize('admin', 'manager'), dispatchController.getHistory);

// @route   POST /api/dispatch
// @desc    Create a new dispatch request
// @access  Private (admin, manager)
router.post('/', authenticate, authorize('admin', 'manager'), dispatchController.createRequest);

// @route   PUT /api/dispatch/approve/:requestId
// @desc    Approve and activate a dispatch request
// @access  Private (admin, manager)
router.put('/approve/:requestId', authenticate, authorize('admin', 'manager'), dispatchController.approveRequest);

// @route   PUT /api/dispatch/complete/:requestId
// @desc    Mark a trip as completed
// @access  Private (admin, manager)
router.put('/complete/:requestId', authenticate, authorize('admin', 'manager'), dispatchController.completeTrip);

// @route   GET /api/dispatch/preview-assign
// @desc    Preview best vehicle+driver match without creating a request
// @access  Private (admin, manager)
router.get('/preview-assign', authenticate, authorize('admin', 'manager'), dispatchController.previewAutoAssign);

// @route   POST /api/dispatch/auto-assign
// @desc    Create dispatch request with automatic best-match vehicle + driver
// @access  Private (admin, manager)
router.post('/auto-assign', authenticate, authorize('admin', 'manager'), dispatchController.autoAssignRequest);

// @route   DELETE /api/dispatch/reject/:requestId
// @desc    Reject a dispatch request
// @access  Private (admin, manager)
router.delete('/reject/:requestId', authenticate, authorize('admin', 'manager'), dispatchController.rejectRequest);

// @route   POST /api/dispatch/location
// @desc    Receive live GPS location from driver app / python sim
// @access  Public (API-key header checked)
router.post('/location', dispatchController.updateLocation);

// @route   GET /api/dispatch/live-locations
// @desc    Return all active driver locations (last 5 min)
// @access  Private (admin, manager)
router.get('/live-locations', authenticate, authorize('admin', 'manager'), dispatchController.getLiveLocations);

module.exports = router;
