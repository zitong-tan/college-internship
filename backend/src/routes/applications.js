const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

/**
 * Application Routes
 * All routes require authentication
 */

// Submit application (students only)
router.post('/', 
  authenticate, 
  authorize('student'), 
  applicationController.submitApplication
);

// Get application list (all authenticated users)
router.get('/', 
  authenticate, 
  applicationController.getApplications
);

// Get application details (all authenticated users)
router.get('/:id', 
  authenticate, 
  applicationController.getApplicationById
);

// Approve application (teachers only)
router.put('/:id/approve', 
  authenticate, 
  authorize('teacher'), 
  applicationController.approveApplication
);

// Reject application (teachers only)
router.put('/:id/reject', 
  authenticate, 
  authorize('teacher'), 
  applicationController.rejectApplication
);

module.exports = router;
