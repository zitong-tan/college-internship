import { ref } from 'vue';
import { ElLoading } from 'element-plus';

/**
 * Composable for managing loading states
 */
export function useLoading(initialState = false) {
  const loading = ref(initialState);
  const loadingInstance = ref(null);

  /**
   * Start loading
   */
  const startLoading = (text = '加载中...') => {
    loading.value = true;
  };

  /**
   * Stop loading
   */
  const stopLoading = () => {
    loading.value = false;
  };

  /**
   * Show fullscreen loading
   */
  const showFullscreenLoading = (text = '加载中...') => {
    loadingInstance.value = ElLoading.service({
      lock: true,
      text,
      background: 'rgba(0, 0, 0, 0.7)'
    });
  };

  /**
   * Hide fullscreen loading
   */
  const hideFullscreenLoading = () => {
    if (loadingInstance.value) {
      loadingInstance.value.close();
      loadingInstance.value = null;
    }
  };

  /**
   * Execute async function with loading state
   */
  const withLoading = async (fn, options = {}) => {
    const { 
      fullscreen = false, 
      text = '加载中...', 
      errorHandler = null 
    } = options;

    try {
      if (fullscreen) {
        showFullscreenLoading(text);
      } else {
        startLoading(text);
      }

      const result = await fn();
      return result;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        throw error;
      }
    } finally {
      if (fullscreen) {
        hideFullscreenLoading();
      } else {
        stopLoading();
      }
    }
  };

  return {
    loading,
    startLoading,
    stopLoading,
    showFullscreenLoading,
    hideFullscreenLoading,
    withLoading
  };
}

/**
 * Composable for managing multiple loading states
 */
export function useMultipleLoading() {
  const loadingStates = ref({});

  const setLoading = (key, value) => {
    loadingStates.value[key] = value;
  };

  const isLoading = (key) => {
    return loadingStates.value[key] || false;
  };

  const isAnyLoading = () => {
    return Object.values(loadingStates.value).some(v => v);
  };

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading
  };
}

export default useLoading;
