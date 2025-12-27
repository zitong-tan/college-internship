const { successResponse, errorResponse } = require('../utils/response');
const Position = require('../models/Position');
const Enterprise = require('../models/Enterprise');
const Application = require('../models/Application');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const operationLogService = require('../services/operationLogService');

/**
 * @route   POST /api/positions
 * @desc    Create a new position
 * @access  Private (Enterprise only)
 */
const createPosition = async (req, res) => {
  try {
    const { title, description, requirements, total_slots, start_date, end_date } = req.body;

    // Validate required fields
    if (!title || !description || !total_slots || !start_date || !end_date) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        [
          { field: 'title', message: 'Title is required' },
          { field: 'description', message: 'Description is required' },
          { field: 'total_slots', message: 'Total slots is required' },
          { field: 'start_date', message: 'Start date is required' },
          { field: 'end_date', message: 'End date is required' }
        ].filter(error => !req.body[error.field])
      );
    }

    // Validate total_slots is a positive integer
    if (!Number.isInteger(total_slots) || total_slots < 1) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        [{ field: 'total_slots', message: 'Total slots must be a positive integer' }]
      );
    }

    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        [{ field: 'dates', message: 'Invalid date format' }]
      );
    }

    if (endDate <= startDate) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        [{ field: 'end_date', message: 'End date must be after start date' }]
      );
    }

    // Get enterprise_id from authenticated user
    const enterprise = await Enterprise.findOne({
      where: { user_id: req.user.id }
    });

    if (!enterprise) {
      return errorResponse(res, 'Enterprise profile not found', 404, 'NOT_FOUND');
    }

    // Create position
    const position = await Position.create({
      enterprise_id: enterprise.id,
      title,
      description,
      requirements: requirements || null,
      total_slots,
      available_slots: total_slots, // Initially all slots are available
      start_date,
      end_date,
      status: 'open'
    });

    // Log position creation
    await operationLogService.logPositionCreation(req.user.id, position.id, title, req);

    return successResponse(res, position, 'Position created successfully', 201);
  } catch (error) {
    console.error('Create position error:', error);
    return errorResponse(res, 'Failed to create position', 500, 'INTERNAL_ERROR');
  }
};

/**
 * @route   GET /api/positions
 * @desc    Get positions list with search and filter
 * @access  Public
 */
const getPositions = async (req, res) => {
  try {
    const { 
      keyword, 
      enterprise_id, 
      status,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build where clause
    const where = {};

    // Keyword search (title or description)
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // Filter by enterprise
    if (enterprise_id) {
      where.enterprise_id = enterprise_id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Check for expired positions and update status
    const currentDate = new Date().toISOString().split('T')[0];
    await Position.update(
      { status: 'closed' },
      {
        where: {
          end_date: { [Op.lt]: currentDate },
          status: { [Op.ne]: 'closed' }
        }
      }
    );

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query positions
    const { count, rows: positions } = await Position.findAndCountAll({
      where,
      include: [
        {
          model: Enterprise,
          as: 'Enterprise',
          attributes: ['id', 'company_name', 'industry']
        }
      ],
      order: [['created_at', 'DESC']], // Sort by creation time descending
      limit: parseInt(limit),
      offset: offset
    });

    return successResponse(res, {
      positions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    }, 'Positions retrieved successfully');
  } catch (error) {
    console.error('Get positions error:', error);
    return errorResponse(res, 'Failed to retrieve positions', 500, 'INTERNAL_ERROR');
  }
};

/**
 * @route   GET /api/positions/:id
 * @desc    Get position details
 * @access  Public
 */
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await Position.findByPk(id, {
      include: [
        {
          model: Enterprise,
          as: 'Enterprise',
          attributes: ['id', 'company_name', 'industry', 'address', 'website']
        }
      ]
    });

    if (!position) {
      return errorResponse(res, 'Position not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, position, 'Position retrieved successfully');
  } catch (error) {
    console.error('Get position error:', error);
    return errorResponse(res, 'Failed to retrieve position', 500, 'INTERNAL_ERROR');
  }
};

/**
 * @route   PUT /api/positions/:id
 * @desc    Update position
 * @access  Private (Enterprise only - own positions)
 */
const updatePosition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, description, requirements, total_slots, start_date, end_date, status } = req.body;

    // Find position
    const position = await Position.findByPk(id, { transaction });

    if (!position) {
      await transaction.rollback();
      return errorResponse(res, 'Position not found', 404, 'NOT_FOUND');
    }

    // Get enterprise_id from authenticated user
    const enterprise = await Enterprise.findOne({
      where: { user_id: req.user.id },
      transaction
    });

    if (!enterprise) {
      await transaction.rollback();
      return errorResponse(res, 'Enterprise profile not found', 404, 'NOT_FOUND');
    }

    // Check if position belongs to this enterprise
    if (position.enterprise_id !== enterprise.id) {
      await transaction.rollback();
      return errorResponse(
        res,
        'You do not have permission to update this position',
        403,
        'FORBIDDEN'
      );
    }

    // Validate fields if provided
    const updates = {};

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'title', message: 'Title cannot be empty' }]
        );
      }
      updates.title = title;
    }

    if (description !== undefined) {
      if (!description || description.trim() === '') {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'description', message: 'Description cannot be empty' }]
        );
      }
      updates.description = description;
    }

    if (requirements !== undefined) {
      updates.requirements = requirements;
    }

    if (total_slots !== undefined) {
      if (!Number.isInteger(total_slots) || total_slots < 1) {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'total_slots', message: 'Total slots must be a positive integer' }]
        );
      }
      
      // Calculate new available_slots
      const usedSlots = position.total_slots - position.available_slots;
      updates.total_slots = total_slots;
      updates.available_slots = Math.max(0, total_slots - usedSlots);
    }

    if (start_date !== undefined || end_date !== undefined) {
      const newStartDate = start_date ? new Date(start_date) : position.start_date;
      const newEndDate = end_date ? new Date(end_date) : position.end_date;

      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'dates', message: 'Invalid date format' }]
        );
      }

      if (newEndDate <= newStartDate) {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'end_date', message: 'End date must be after start date' }]
        );
      }

      if (start_date) updates.start_date = start_date;
      if (end_date) updates.end_date = end_date;
    }

    if (status !== undefined) {
      if (!['open', 'full', 'closed'].includes(status)) {
        await transaction.rollback();
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          [{ field: 'status', message: 'Invalid status value' }]
        );
      }
      updates.status = status;
    }

    // Update position
    await position.update(updates, { transaction });

    await transaction.commit();

    // Log position update
    await operationLogService.logPositionUpdate(req.user.id, id, req);

    // Reload with associations
    await position.reload({
      include: [
        {
          model: Enterprise,
          as: 'Enterprise',
          attributes: ['id', 'company_name', 'industry']
        }
      ]
    });

    return successResponse(res, position, 'Position updated successfully');
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Update position error:', error);
    return errorResponse(res, 'Failed to update position', 500, 'INTERNAL_ERROR');
  }
};

/**
 * @route   DELETE /api/positions/:id
 * @desc    Delete position
 * @access  Private (Enterprise only - own positions)
 */
const deletePosition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Find position
    const position = await Position.findByPk(id, { transaction });

    if (!position) {
      await transaction.rollback();
      return errorResponse(res, 'Position not found', 404, 'NOT_FOUND');
    }

    // Get enterprise_id from authenticated user
    const enterprise = await Enterprise.findOne({
      where: { user_id: req.user.id },
      transaction
    });

    if (!enterprise) {
      await transaction.rollback();
      return errorResponse(res, 'Enterprise profile not found', 404, 'NOT_FOUND');
    }

    // Check if position belongs to this enterprise
    if (position.enterprise_id !== enterprise.id) {
      await transaction.rollback();
      return errorResponse(
        res,
        'You do not have permission to delete this position',
        403,
        'FORBIDDEN'
      );
    }

    // Check for pending applications
    const pendingApplications = await Application.count({
      where: {
        position_id: id,
        status: 'pending'
      },
      transaction
    });

    if (pendingApplications > 0) {
      await transaction.rollback();
      return errorResponse(
        res,
        'Cannot delete position with pending applications',
        409,
        'CONFLICT'
      );
    }

    // Delete position
    await position.destroy({ transaction });

    await transaction.commit();

    // Log position deletion
    await operationLogService.logPositionDeletion(req.user.id, id, req);

    return successResponse(res, null, 'Position deleted successfully');
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Delete position error:', error);
    return errorResponse(res, 'Failed to delete position', 500, 'INTERNAL_ERROR');
  }
};

module.exports = {
  createPosition,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition
};
