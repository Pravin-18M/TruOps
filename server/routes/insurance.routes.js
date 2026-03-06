const express = require('express');
const router = express.Router();
const multer = require('multer');
const insuranceController = require('../controllers/insurance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const allowedMimeTypes = [
	'application/pdf',
	'image/jpeg',
	'image/png',
	'image/jpg'
];

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(new Error('Unsupported file format. Please upload PDF, JPG, or PNG files only.'));
		}
		cb(null, true);
	}
});

function handleInsuranceUpload(req, res, next) {
	upload.fields([{ name: 'policy_document', maxCount: 1 }])(req, res, (err) => {
		if (!err) return next();
		if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ error: 'File size exceeds 10 MB limit.' });
		}
		return res.status(400).json({ error: err.message || 'File upload failed.' });
	});
}

// @route   GET /api/insurance
// @desc    Get all policies with vehicle data
// @access  Private (admin, manager)
router.get('/', authenticate, authorize('admin', 'manager'), insuranceController.getAllPolicies);

// @route   GET /api/insurance/stats
// @desc    Get insurance KPI stats
// @access  Private (admin, manager)
router.get('/stats', authenticate, authorize('admin', 'manager'), insuranceController.getInsuranceStats);

// @route   GET /api/insurance/urgent
// @desc    Get policies expiring within 7 days + already expired
// @access  Private (admin, manager)
router.get('/urgent', authenticate, authorize('admin', 'manager'), insuranceController.getUrgentPolicies);

// @route   GET /api/insurance/upcoming
// @desc    Get upcoming renewals (next 30 days) for dashboard
// @access  Private (admin, manager)
router.get('/upcoming', authenticate, authorize('admin', 'manager'), insuranceController.getUpcomingRenewals);

// @route   GET /api/insurance/fleet-view
// @desc    All vehicles with their insurance status (vehicle-centric — every asset appears)
// @access  Private (admin, manager)
router.get('/fleet-view', authenticate, authorize('admin', 'manager'), insuranceController.getFleetInsuranceView);

// @route   PUT /api/insurance/:policyId
// @desc    Update / renew a policy
// @access  Private (admin)
router.put('/:policyId', authenticate, authorize('admin'), handleInsuranceUpload, insuranceController.updatePolicy);

// @route   POST /api/insurance
// @desc    Add a new insurance policy (supports optional policy document upload)
// @access  Private (admin)
router.post('/', authenticate, authorize('admin'), handleInsuranceUpload, insuranceController.addPolicy);

// @route   DELETE /api/insurance/:policyId
// @desc    Delete a policy
// @access  Private (admin)
router.delete('/:policyId', authenticate, authorize('admin'), insuranceController.deletePolicy);

module.exports = router;
