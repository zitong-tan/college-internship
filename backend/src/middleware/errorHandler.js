const { internalErrorResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Validates Requirements 10.4 (operation logging)
 */
const errorHandler = (err, req, res, next) => {
  // Log error details with enhanced logging
  logger.error('Application Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR',
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    logger.warn('Validation Error', { details, url: req.url });
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', '数据验证失败', details)
    );
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    logger.warn('Unique Constraint Error', { field, url: req.url });
    return res.status(409).json(
      errorResponse('DUPLICATE_ERROR', `${field} 已存在`)
    );
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    logger.warn('Foreign Key Constraint Error', { url: req.url });
    return res.status(400).json(
      errorResponse('CONSTRAINT_ERROR', '数据完整性约束违反')
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT Error', { message: err.message, url: req.url });
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', '无效的认证令牌')
    );
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('Token Expired', { url: req.url });
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', '认证令牌已过期')
    );
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    logger.warn('File Upload Error', { message: err.message, url: req.url });
    return res.status(400).json(
      errorResponse('UPLOAD_ERROR', `文件上传失败: ${err.message}`)
    );
  }

  // Handle unknown errors
  logger.error('Unexpected Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  return res.status(500).json(internalErrorResponse());
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route Not Found', { url: req.url, method: req.method });
  res.status(404).json(
    errorResponse('NOT_FOUND', `路由 ${req.url} 不存在`)
  );
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });
  
  next();
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  requestLogger
};
