/**
 * API Routes Index
 * Central place to register all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const positionRoutes = require('./positions');
const applicationRoutes = require('./applications');
const internshipRoutes = require('./internships');
const notificationRoutes = require('./notifications');
const statisticsRoutes = require('./statistics');

// Register routes
router.use('/auth', authRoutes);
router.use('/positions', positionRoutes);
router.use('/applications', applicationRoutes);
router.use('/internships', internshipRoutes);
router.use('/notifications', notificationRoutes);
router.use('/statistics', statisticsRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University Internship Management API',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

module.exports = router;
