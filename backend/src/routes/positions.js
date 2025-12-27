const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/positions
 * @desc    Get positions list with search and filter
 * @access  Public
 */
router.get('/', positionController.getPositions);

/**
 * @route   GET /api/positions/:id
 * @desc    Get position details
 * @access  Public
 */
router.get('/:id', positionController.getPositionById);

/**
 * @route   POST /api/positions
 * @desc    Create a new position
 * @access  Private (Enterprise only)
 */
router.post('/', authenticate, authorize('enterprise'), positionController.createPosition);

/**
 * @route   PUT /api/positions/:id
 * @desc    Update position
 * @access  Private (Enterprise only - own positions)
 */
router.put('/:id', authenticate, authorize('enterprise'), positionController.updatePosition);

/**
 * @route   DELETE /api/positions/:id
 * @desc    Delete position
 * @access  Private (Enterprise only - own positions)
 */
router.delete('/:id', authenticate, authorize('enterprise'), positionController.deletePosition);

module.exports = router;
