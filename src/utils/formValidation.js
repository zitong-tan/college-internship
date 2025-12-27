/**
 * Form validation rules and utilities
 * Validates Requirements 2.4, 4.4 (form validation)
 */

/**
 * Common validation rules
 */
export const validationRules = {
  // Required field
  required: (message = '此字段为必填项') => ({
    required: true,
    message,
    trigger: 'blur'
  }),

  // Email validation
  email: (message = '请输入有效的邮箱地址') => ({
    type: 'email',
    message,
    trigger: 'blur'
  }),

  // Phone number validation (Chinese mobile)
  phone: (message = '请输入有效的手机号码') => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: 'blur'
  }),

  // Username validation (3-50 characters, alphanumeric and underscore)
  username: (message = '用户名必须是3-50个字符，只能包含字母、数字和下划线') => ({
    pattern: /^[a-zA-Z0-9_]{3,50}$/,
    message,
    trigger: 'blur'
  }),

  // Password validation (minimum 6 characters)
  password: (message = '密码至少需要6个字符') => ({
    min: 6,
    message,
    trigger: 'blur'
  }),

  // Length range validation
  length: (min, max, message) => ({
    min,
    max,
    message: message || `长度必须在 ${min} 到 ${max} 个字符之间`,
    trigger: 'blur'
  }),

  // Minimum length
  minLength: (min, message) => ({
    min,
    message: message || `最少需要 ${min} 个字符`,
    trigger: 'blur'
  }),

  // Maximum length
  maxLength: (max, message) => ({
    max,
    message: message || `最多允许 ${max} 个字符`,
    trigger: 'blur'
  }),

  // Number range validation
  numberRange: (min, max, message) => ({
    type: 'number',
    min,
    max,
    message: message || `数值必须在 ${min} 到 ${max} 之间`,
    trigger: 'blur'
  }),

  // Positive integer
  positiveInteger: (message = '请输入正整数') => ({
    validator: (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback();
        return;
      }
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }),

  // URL validation
  url: (message = '请输入有效的URL地址') => ({
    type: 'url',
    message,
    trigger: 'blur'
  }),

  // Date validation
  date: (message = '请选择日期') => ({
    type: 'date',
    required: true,
    message,
    trigger: 'change'
  }),

  // Date range validation
  dateRange: (message = '结束日期必须晚于开始日期') => ({
    validator: (rule, value, callback) => {
      if (!value || value.length !== 2) {
        callback();
        return;
      }
      const [start, end] = value;
      if (start && end && new Date(start) >= new Date(end)) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }),

  // Custom validator
  custom: (validator, message, trigger = 'blur') => ({
    validator,
    message,
    trigger
  })
};

/**
 * Position form validation rules
 * Validates Requirement 2.4
 */
export const positionRules = {
  title: [
    validationRules.required('岗位标题不能为空'),
    validationRules.maxLength(200, '岗位标题最多200个字符')
  ],
  description: [
    validationRules.required('岗位描述不能为空'),
    validationRules.minLength(10, '岗位描述至少需要10个字符')
  ],
  requirements: [
    validationRules.minLength(10, '岗位要求至少需要10个字符')
  ],
  total_slots: [
    validationRules.required('招聘名额不能为空'),
    validationRules.positiveInteger('招聘名额必须是正整数')
  ],
  start_date: [
    validationRules.date('请选择开始日期')
  ],
  end_date: [
    validationRules.date('请选择结束日期'),
    {
      validator: (rule, value, callback, source) => {
        if (value && source.start_date && new Date(value) <= new Date(source.start_date)) {
          callback(new Error('结束日期必须晚于开始日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

/**
 * Application form validation rules
 * Validates Requirement 4.4
 */
export const applicationRules = {
  personal_statement: [
    validationRules.required('个人简介不能为空'),
    validationRules.minLength(20, '个人简介至少需要20个字符'),
    validationRules.maxLength(1000, '个人简介最多1000个字符')
  ],
  contact_info: [
    validationRules.required('联系方式不能为空'),
    validationRules.phone('请输入有效的手机号码')
  ]
};

/**
 * User registration validation rules
 */
export const userRules = {
  username: [
    validationRules.required('用户名不能为空'),
    validationRules.username()
  ],
  password: [
    validationRules.required('密码不能为空'),
    validationRules.password()
  ],
  confirmPassword: [
    validationRules.required('请确认密码'),
    {
      validator: (rule, value, callback, source) => {
        if (value !== source.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    validationRules.required('邮箱不能为空'),
    validationRules.email()
  ],
  phone: [
    validationRules.phone()
  ],
  real_name: [
    validationRules.required('真实姓名不能为空'),
    validationRules.length(2, 50, '姓名长度必须在2-50个字符之间')
  ]
};

/**
 * Evaluation form validation rules
 */
export const evaluationRules = {
  score: [
    validationRules.required('评分不能为空'),
    validationRules.numberRange(0, 100, '评分必须在0-100之间')
  ],
  comment: [
    validationRules.required('评语不能为空'),
    validationRules.minLength(10, '评语至少需要10个字符'),
    validationRules.maxLength(500, '评语最多500个字符')
  ]
};

/**
 * Internship log validation rules
 */
export const logRules = {
  content: [
    validationRules.required('日志内容不能为空'),
    validationRules.minLength(20, '日志内容至少需要20个字符'),
    validationRules.maxLength(2000, '日志内容最多2000个字符')
  ],
  log_date: [
    validationRules.date('请选择日志日期')
  ]
};

/**
 * Validate form and show first error
 */
export const validateForm = async (formRef) => {
  if (!formRef) {
    return false;
  }

  try {
    await formRef.validate();
    return true;
  } catch (error) {
    // Form validation failed
    return false;
  }
};

/**
 * Reset form validation
 */
export const resetForm = (formRef) => {
  if (formRef) {
    formRef.resetFields();
  }
};

/**
 * Clear form validation
 */
export const clearValidation = (formRef) => {
  if (formRef) {
    formRef.clearValidate();
  }
};

/**
 * Validate single field
 */
export const validateField = (formRef, field) => {
  if (formRef) {
    return formRef.validateField(field);
  }
  return Promise.resolve();
};

export default {
  validationRules,
  positionRules,
  applicationRules,
  userRules,
  evaluationRules,
  logRules,
  validateForm,
  resetForm,
  clearValidation,
  validateField
};
