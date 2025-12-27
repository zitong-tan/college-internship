/**
 * Unified API Response Format
 * 统一的API响应格式
 * 
 * 支持两种调用方式:
 * 1. successResponse(res, data, message) - 直接发送响应
 * 2. successResponse(data, message) - 返回响应对象（需要手动 res.json()）
 */

/**
 * Success response
 * @param {Object} resOrData - Express response object OR response data
 * @param {Object|String} dataOrMessage - Response data OR success message
 * @param {String} message - Success message (optional)
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (resOrData, dataOrMessage = null, message = '操作成功', statusCode = 200) => {
  // 检查第一个参数是否是 Express response 对象
  if (resOrData && typeof resOrData.status === 'function' && typeof resOrData.json === 'function') {
    // 新方式: successResponse(res, data, message, statusCode)
    const res = resOrData;
    const data = dataOrMessage;
    const msg = message;
    return res.status(statusCode).json({
      success: true,
      data,
      message: msg,
      timestamp: Date.now()
    });
  } else {
    // 旧方式: successResponse(data, message) - 返回对象
    const data = resOrData;
    const msg = typeof dataOrMessage === 'string' ? dataOrMessage : '操作成功';
    return {
      success: true,
      data,
      message: msg,
      timestamp: Date.now()
    };
  }
};

/**
 * Error response
 * @param {Object|String} resOrCode - Express response object OR error code
 * @param {String} messageOrMsg - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {String} code - Error code
 * @param {Array} details - Error details (optional)
 */
const errorResponse = (resOrCode, messageOrMsg = '操作失败', statusCode = 400, code = 'ERROR', details = []) => {
  // 检查第一个参数是否是 Express response 对象
  if (resOrCode && typeof resOrCode.status === 'function' && typeof resOrCode.json === 'function') {
    // 新方式: errorResponse(res, message, statusCode, code, details)
    const res = resOrCode;
    const message = messageOrMsg;
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: Date.now()
    });
  } else {
    // 旧方式: errorResponse(code, message, details) - 返回对象
    const errCode = resOrCode;
    const message = messageOrMsg;
    const errDetails = typeof statusCode === 'object' ? statusCode : [];
    return {
      success: false,
      error: {
        code: errCode,
        message,
        details: errDetails
      },
      timestamp: Date.now()
    };
  }
};

/**
 * Validation error response
 * @param {Object|Array} resOrErrors - Express response object OR validation errors
 * @param {Array} errors - Validation errors (if first param is res)
 */
const validationErrorResponse = (resOrErrors, errors = null) => {
  if (resOrErrors && typeof resOrErrors.status === 'function') {
    const res = resOrErrors;
    const errList = errors || [];
    return errorResponse(
      res,
      '验证失败',
      400,
      'VALIDATION_ERROR',
      errList.map(err => ({
        field: err.param || err.field,
        message: err.msg || err.message
      }))
    );
  } else {
    const errList = resOrErrors || [];
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '验证失败',
        details: errList.map(err => ({
          field: err.param || err.field,
          message: err.msg || err.message
        }))
      },
      timestamp: Date.now()
    };
  }
};

/**
 * Authentication error response
 * @param {Object} res - Express response object (optional)
 */
const authErrorResponse = (res = null) => {
  if (res && typeof res.status === 'function') {
    return errorResponse(res, '认证失败，请重新登录', 401, 'UNAUTHORIZED');
  }
  return errorResponse('UNAUTHORIZED', '认证失败，请重新登录');
};

/**
 * Authorization error response
 * @param {Object} res - Express response object (optional)
 */
const forbiddenErrorResponse = (res = null) => {
  if (res && typeof res.status === 'function') {
    return errorResponse(res, '您没有权限执行此操作', 403, 'FORBIDDEN');
  }
  return errorResponse('FORBIDDEN', '您没有权限执行此操作');
};

/**
 * Not found error response
 * @param {Object|String} resOrResource - Express response object OR resource name
 * @param {String} resource - Resource name (if first param is res)
 */
const notFoundErrorResponse = (resOrResource = '资源', resource = '资源') => {
  if (resOrResource && typeof resOrResource.status === 'function') {
    const res = resOrResource;
    return errorResponse(res, `请求的${resource}不存在`, 404, 'NOT_FOUND');
  }
  const resourceName = typeof resOrResource === 'string' ? resOrResource : '资源';
  return {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `请求的${resourceName}不存在`,
      details: []
    },
    timestamp: Date.now()
  };
};

/**
 * Business logic error response
 * @param {Object|String} resOrCode - Express response object OR error code
 * @param {String} messageOrCode - Error message OR error code
 * @param {String} code - Error code (if first param is res)
 */
const businessErrorResponse = (resOrCode, messageOrCode, code = 'BUSINESS_ERROR') => {
  if (resOrCode && typeof resOrCode.status === 'function') {
    const res = resOrCode;
    return errorResponse(res, messageOrCode, 400, code);
  }
  return errorResponse(resOrCode, messageOrCode);
};

/**
 * Internal server error response
 * @param {Object} res - Express response object (optional)
 */
const internalErrorResponse = (res = null) => {
  if (res && typeof res.status === 'function') {
    return errorResponse(res, '服务器内部错误，请稍后重试', 500, 'INTERNAL_ERROR');
  }
  return errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试');
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  authErrorResponse,
  forbiddenErrorResponse,
  notFoundErrorResponse,
  businessErrorResponse,
  internalErrorResponse
};
