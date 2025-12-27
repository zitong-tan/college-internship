const OperationLog = require('../models/OperationLog');

/**
 * Operation Log Service
 * Handles logging of critical operations for audit purposes
 */

/**
 * Log an operation
 * @param {Object} logData - Log data
 * @param {number} logData.user_id - User ID who performed the operation
 * @param {string} logData.operation_type - Type of operation
 * @param {string} logData.operation_desc - Description of the operation
 * @param {string} logData.ip_address - IP address
 * @param {string} logData.user_agent - User agent
 * @returns {Promise<OperationLog>}
 */
async function logOperation(logData) {
  try {
    const log = await OperationLog.create({
      user_id: logData.user_id || null,
      operation_type: logData.operation_type,
      operation_desc: logData.operation_desc || null,
      ip_address: logData.ip_address || null,
      user_agent: logData.user_agent || null,
      created_at: new Date()
    });

    return log;
  } catch (error) {
    // Log to console but don't throw - logging should not break the application
    console.error('Failed to create operation log:', error);
    return null;
  }
}

/**
 * Log user login
 * @param {number} userId - User ID
 * @param {string} username - Username
 * @param {Object} req - Express request object
 * @param {boolean} success - Whether login was successful
 * @param {string} errorMessage - Error message if failed
 */
async function logLogin(userId, username, req, success = true, errorMessage = null) {
  return logOperation({
    user_id: userId,
    operation_type: 'login',
    operation_desc: `User ${username} ${success ? 'logged in successfully' : 'failed to log in'}${errorMessage ? ': ' + errorMessage : ''}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log application approval
 * @param {number} userId - User ID (teacher)
 * @param {number} applicationId - Application ID
 * @param {Object} req - Express request object
 */
async function logApplicationApproval(userId, applicationId, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'application_approve',
    operation_desc: `Teacher approved application #${applicationId}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log application rejection
 * @param {number} userId - User ID (teacher)
 * @param {number} applicationId - Application ID
 * @param {string} reason - Rejection reason
 * @param {Object} req - Express request object
 */
async function logApplicationRejection(userId, applicationId, reason, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'application_reject',
    operation_desc: `Teacher rejected application #${applicationId}: ${reason}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log evaluation submission
 * @param {number} userId - User ID (teacher or enterprise)
 * @param {number} internshipId - Internship ID
 * @param {string} evaluatorType - Type of evaluator (teacher or enterprise)
 * @param {number} score - Evaluation score
 * @param {Object} req - Express request object
 */
async function logEvaluationSubmission(userId, internshipId, evaluatorType, score, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'evaluation_submit',
    operation_desc: `${evaluatorType} submitted evaluation for internship #${internshipId} with score ${score}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log position creation
 * @param {number} userId - User ID (enterprise)
 * @param {number} positionId - Position ID
 * @param {string} title - Position title
 * @param {Object} req - Express request object
 */
async function logPositionCreation(userId, positionId, title, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'position_create',
    operation_desc: `Enterprise created position: ${title}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log position update
 * @param {number} userId - User ID (enterprise)
 * @param {number} positionId - Position ID
 * @param {Object} req - Express request object
 */
async function logPositionUpdate(userId, positionId, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'position_update',
    operation_desc: `Enterprise updated position #${positionId}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log position deletion
 * @param {number} userId - User ID (enterprise)
 * @param {number} positionId - Position ID
 * @param {Object} req - Express request object
 */
async function logPositionDeletion(userId, positionId, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'position_delete',
    operation_desc: `Enterprise deleted position #${positionId}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Log application submission
 * @param {number} userId - User ID (student)
 * @param {number} applicationId - Application ID
 * @param {number} positionId - Position ID
 * @param {Object} req - Express request object
 */
async function logApplicationSubmission(userId, applicationId, positionId, req) {
  return logOperation({
    user_id: userId,
    operation_type: 'application_submit',
    operation_desc: `Student submitted application #${applicationId} for position #${positionId}`,
    ip_address: getClientIp(req),
    user_agent: req.get('user-agent')
  });
}

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIp(req) {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown';
}

/**
 * Get operation logs with filters
 * @param {Object} filters - Filter options
 * @param {number} filters.user_id - Filter by user ID
 * @param {string} filters.operation_type - Filter by operation type
 * @param {Date} filters.start_date - Filter by start date
 * @param {Date} filters.end_date - Filter by end date
 * @param {number} filters.limit - Limit number of results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise<Array>}
 */
async function getOperationLogs(filters = {}) {
  try {
    const where = {};
    
    if (filters.user_id) {
      where.user_id = filters.user_id;
    }
    
    if (filters.operation_type) {
      where.operation_type = filters.operation_type;
    }
    
    if (filters.start_date || filters.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at[require('sequelize').Op.gte] = filters.start_date;
      }
      if (filters.end_date) {
        where.created_at[require('sequelize').Op.lte] = filters.end_date;
      }
    }

    const logs = await OperationLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 100,
      offset: filters.offset || 0
    });

    return logs;
  } catch (error) {
    console.error('Failed to get operation logs:', error);
    return [];
  }
}

module.exports = {
  logOperation,
  logLogin,
  logApplicationApproval,
  logApplicationRejection,
  logEvaluationSubmission,
  logPositionCreation,
  logPositionUpdate,
  logPositionDeletion,
  logApplicationSubmission,
  getOperationLogs
};
