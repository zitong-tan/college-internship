/**
 * Statistics Routes
 * Routes for statistical data and reports
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const statisticsController = require('../controllers/statisticsController');

/**
 * @route   GET /api/statistics/overview
 * @desc    Get statistics overview with optional time filtering
 * @access  Teacher only
 * @query   startDate, endDate, period (month|semester|year)
 */
router.get(
  '/overview',
  authenticate,
  authorize(['teacher']),
  statisticsController.getStatisticsOverview
);

/**
 * @route   GET /api/statistics/enterprise/:enterpriseId
 * @desc    Get enterprise-specific statistics
 * @access  Teacher, Enterprise (own data)
 */
router.get(
  '/enterprise/:enterpriseId',
  authenticate,
  authorize(['teacher', 'enterprise']),
  statisticsController.getEnterpriseStatistics
);

/**
 * @route   GET /api/statistics/timeseries
 * @desc    Get time-series statistics
 * @access  Teacher only
 * @query   startDate, endDate, groupBy (day|week|month|year)
 */
router.get(
  '/timeseries',
  authenticate,
  authorize(['teacher']),
  statisticsController.getTimeSeriesStatistics
);

/**
 * @route   GET /api/statistics/export/excel
 * @desc    Export statistics report as Excel
 * @access  Teacher only
 * @query   startDate, endDate, period
 */
router.get(
  '/export/excel',
  authenticate,
  authorize(['teacher']),
  statisticsController.exportExcelReport
);

/**
 * @route   GET /api/statistics/export/pdf
 * @desc    Export statistics report as PDF
 * @access  Teacher only
 * @query   startDate, endDate, period
 */
router.get(
  '/export/pdf',
  authenticate,
  authorize(['teacher']),
  statisticsController.exportPdfReport
);

module.exports = router;
