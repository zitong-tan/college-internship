import { ElMessage, ElNotification } from 'element-plus';

/**
 * Error types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  BUSINESS: 'BUSINESS_ERROR'
};

/**
 * Error messages mapping
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: '网络连接失败，请检查您的网络',
  [ERROR_TYPES.VALIDATION]: '数据验证失败，请检查输入',
  [ERROR_TYPES.AUTHENTICATION]: '认证失败，请重新登录',
  [ERROR_TYPES.AUTHORIZATION]: '您没有权限执行此操作',
  [ERROR_TYPES.NOT_FOUND]: '请求的资源不存在',
  [ERROR_TYPES.SERVER]: '服务器错误，请稍后重试',
  [ERROR_TYPES.BUSINESS]: '操作失败'
};

/**
 * Show error message
 */
export const showError = (message, type = 'error', duration = 3000) => {
  ElMessage({
    message,
    type,
    duration,
    showClose: true
  });
};

/**
 * Show error notification
 */
export const showErrorNotification = (title, message, duration = 4500) => {
  ElNotification({
    title,
    message,
    type: 'error',
    duration,
    position: 'top-right'
  });
};

/**
 * Show success message
 */
export const showSuccess = (message, duration = 3000) => {
  ElMessage({
    message,
    type: 'success',
    duration,
    showClose: true
  });
};

/**
 * Show warning message
 */
export const showWarning = (message, duration = 3000) => {
  ElMessage({
    message,
    type: 'warning',
    duration,
    showClose: true
  });
};

/**
 * Show info message
 */
export const showInfo = (message, duration = 3000) => {
  ElMessage({
    message,
    type: 'info',
    duration,
    showClose: true
  });
};

/**
 * Handle API error
 */
export const handleApiError = (error) => {
  if (!error.response) {
    // Network error
    showError(ERROR_MESSAGES[ERROR_TYPES.NETWORK]);
    return ERROR_TYPES.NETWORK;
  }

  const { status, data } = error.response;
  const errorMessage = data?.error?.message || ERROR_MESSAGES[ERROR_TYPES.SERVER];

  switch (status) {
    case 400:
      // Validation error - show detailed errors if available
      if (data?.error?.details && data.error.details.length > 0) {
        const details = data.error.details
          .map(d => `${d.field}: ${d.message}`)
          .join('\n');
        showErrorNotification('数据验证失败', details);
      } else {
        showError(errorMessage);
      }
      return ERROR_TYPES.VALIDATION;

    case 401:
      showError(ERROR_MESSAGES[ERROR_TYPES.AUTHENTICATION]);
      return ERROR_TYPES.AUTHENTICATION;

    case 403:
      showError(ERROR_MESSAGES[ERROR_TYPES.AUTHORIZATION]);
      return ERROR_TYPES.AUTHORIZATION;

    case 404:
      showError(ERROR_MESSAGES[ERROR_TYPES.NOT_FOUND]);
      return ERROR_TYPES.NOT_FOUND;

    case 409:
    case 422:
      showError(errorMessage);
      return ERROR_TYPES.BUSINESS;

    case 500:
    default:
      showError(ERROR_MESSAGES[ERROR_TYPES.SERVER]);
      return ERROR_TYPES.SERVER;
  }
};

/**
 * Handle form validation error
 */
export const handleFormError = (formRef) => {
  if (!formRef) return false;
  
  return new Promise((resolve) => {
    formRef.validate((valid, fields) => {
      if (!valid) {
        // Show first error
        const firstError = Object.values(fields)[0];
        if (firstError && firstError[0]) {
          showError(firstError[0].message);
        }
      }
      resolve(valid);
    });
  });
};

/**
 * Log error to console (development only)
 */
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create error boundary handler for Vue components
 */
export const createErrorHandler = (componentName) => {
  return (error, instance, info) => {
    logError(error, {
      component: componentName,
      instance,
      info
    });
    
    showErrorNotification(
      '组件错误',
      `${componentName} 组件发生错误，请刷新页面重试`
    );
  };
};

export default {
  showError,
  showErrorNotification,
  showSuccess,
  showWarning,
  showInfo,
  handleApiError,
  handleFormError,
  logError,
  createErrorHandler,
  ERROR_TYPES
};
