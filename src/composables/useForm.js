import { ref, reactive } from 'vue';
import { showSuccess, showError, handleFormError } from '@/utils/errorHandler';
import { validateForm, resetForm, clearValidation } from '@/utils/formValidation';

/**
 * Composable for form handling with validation and notifications
 */
export function useForm(initialData = {}, rules = {}) {
  const formRef = ref(null);
  const formData = reactive({ ...initialData });
  const loading = ref(false);
  const errors = ref({});

  /**
   * Validate form
   */
  const validate = async () => {
    if (!formRef.value) {
      return false;
    }

    try {
      const valid = await validateForm(formRef.value);
      if (!valid) {
        showError('请检查表单输入');
      }
      return valid;
    } catch (error) {
      showError('表单验证失败');
      return false;
    }
  };

  /**
   * Reset form
   */
  const reset = () => {
    if (formRef.value) {
      resetForm(formRef.value);
    }
    Object.assign(formData, initialData);
    errors.value = {};
  };

  /**
   * Clear validation
   */
  const clear = () => {
    if (formRef.value) {
      clearValidation(formRef.value);
    }
    errors.value = {};
  };

  /**
   * Submit form with validation
   */
  const submit = async (submitFn, options = {}) => {
    const {
      successMessage = '操作成功',
      errorMessage = '操作失败',
      showSuccessMsg = true,
      showErrorMsg = true,
      resetOnSuccess = false
    } = options;

    // Validate form
    const valid = await validate();
    if (!valid) {
      return { success: false, error: 'validation_failed' };
    }

    loading.value = true;
    errors.value = {};

    try {
      const result = await submitFn(formData);
      
      if (showSuccessMsg) {
        showSuccess(successMessage);
      }

      if (resetOnSuccess) {
        reset();
      }

      return { success: true, data: result };
    } catch (error) {
      if (showErrorMsg) {
        const message = error.response?.data?.error?.message || errorMessage;
        showError(message);
      }

      // Handle validation errors from backend
      if (error.response?.data?.error?.details) {
        const details = error.response.data.error.details;
        details.forEach(detail => {
          errors.value[detail.field] = detail.message;
        });
      }

      return { success: false, error };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Set form data
   */
  const setData = (data) => {
    Object.assign(formData, data);
  };

  /**
   * Get form data
   */
  const getData = () => {
    return { ...formData };
  };

  /**
   * Set field value
   */
  const setField = (field, value) => {
    formData[field] = value;
  };

  /**
   * Get field value
   */
  const getField = (field) => {
    return formData[field];
  };

  /**
   * Set field error
   */
  const setError = (field, message) => {
    errors.value[field] = message;
  };

  /**
   * Clear field error
   */
  const clearError = (field) => {
    delete errors.value[field];
  };

  /**
   * Check if form has errors
   */
  const hasErrors = () => {
    return Object.keys(errors.value).length > 0;
  };

  return {
    formRef,
    formData,
    loading,
    errors,
    validate,
    reset,
    clear,
    submit,
    setData,
    getData,
    setField,
    getField,
    setError,
    clearError,
    hasErrors
  };
}

/**
 * Composable for form with real-time validation
 */
export function useFormWithRealTimeValidation(initialData = {}, rules = {}) {
  const form = useForm(initialData, rules);
  const touched = ref({});

  /**
   * Mark field as touched
   */
  const touch = (field) => {
    touched.value[field] = true;
  };

  /**
   * Check if field is touched
   */
  const isTouched = (field) => {
    return touched.value[field] || false;
  };

  /**
   * Validate field on blur
   */
  const validateField = async (field) => {
    touch(field);
    if (form.formRef.value) {
      try {
        await form.formRef.value.validateField(field);
        form.clearError(field);
      } catch (error) {
        // Validation failed, error is already shown by Element Plus
      }
    }
  };

  /**
   * Reset touched state
   */
  const resetTouched = () => {
    touched.value = {};
  };

  return {
    ...form,
    touched,
    touch,
    isTouched,
    validateField,
    resetTouched
  };
}

export default useForm;
