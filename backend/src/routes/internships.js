/**
 * Internship Routes
 * Routes for internship process management
 */

const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { authenticate } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Manually update expired internships status (teacher only)
router.post('/update-expired', internshipController.updateExpiredStatus);

// Get internship list
router.get('/', internshipController.getInternships);

// Get internship details
router.get('/:id', internshipController.getInternship);

// Get internship progress
router.get('/:id/progress', internshipController.getProgress);

// Submit internship log
router.post('/:id/logs', internshipController.submitLog);

// Get internship logs
router.get('/:id/logs', internshipController.getLogs);

// Upload internship file
router.post('/:id/files', uploadFile('file'), internshipController.uploadFile);

// Get internship files
router.get('/:id/files', internshipController.getFiles);

// Submit teacher evaluation
router.post('/:id/evaluate/teacher', internshipController.submitTeacherEvaluation);

// Submit enterprise evaluation
router.post('/:id/evaluate/enterprise', internshipController.submitEnterpriseEvaluation);

// Get evaluation (for students)
router.get('/:id/evaluation', internshipController.getEvaluation);

module.exports = router;
