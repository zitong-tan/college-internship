import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo,
  showErrorNotification 
} from '@/utils/errorHandler';

/**
 * Composable for notifications and messages
 */
export function useNotification() {
  /**
   * Show success message
   */
  const success = (message, duration = 3000) => {
    showSuccess(message, duration);
  };

  /**
   * Show error message
   */
  const error = (message, duration = 3000) => {
    showError(message, duration);
  };

  /**
   * Show warning message
   */
  const warning = (message, duration = 3000) => {
    showWarning(message, duration);
  };

  /**
   * Show info message
   */
  const info = (message, duration = 3000) => {
    showInfo(message, duration);
  };

  /**
   * Show error notification with details
   */
  const errorNotification = (title, message, duration = 4500) => {
    showErrorNotification(title, message, duration);
  };

  /**
   * Show operation success
   */
  const operationSuccess = (operation = '操作') => {
    success(`${operation}成功`);
  };

  /**
   * Show operation error
   */
  const operationError = (operation = '操作', errorMsg = null) => {
    const message = errorMsg || `${operation}失败`;
    error(message);
  };

  /**
   * Confirm dialog helper
   */
  const confirm = async (message, title = '确认', options = {}) => {
    const { ElMessageBox } = await import('element-plus');
    
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        ...options
      });
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Prompt dialog helper
   */
  const prompt = async (message, title = '输入', options = {}) => {
    const { ElMessageBox } = await import('element-plus');
    
    try {
      const { value } = await ElMessageBox.prompt(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        ...options
      });
      return value;
    } catch {
      return null;
    }
  };

  /**
   * Alert dialog helper
   */
  const alert = async (message, title = '提示', options = {}) => {
    const { ElMessageBox } = await import('element-plus');
    
    try {
      await ElMessageBox.alert(message, title, {
        confirmButtonText: '确定',
        ...options
      });
      return true;
    } catch {
      return false;
    }
  };

  return {
    success,
    error,
    warning,
    info,
    errorNotification,
    operationSuccess,
    operationError,
    confirm,
    prompt,
    alert
  };
}

export default useNotification;
