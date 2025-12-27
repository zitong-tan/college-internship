/**
 * Validation utilities for request data
 */

/**
 * Validate position data
 * @param {Object} data - Position data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validatePositionData = (data, isUpdate = false) => {
  const errors = [];

  // Required fields validation (only for create)
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push({ field: 'title', message: 'Title is required and cannot be empty' });
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required and cannot be empty' });
    }

    if (data.total_slots === undefined || data.total_slots === null) {
      errors.push({ field: 'total_slots', message: 'Total slots is required' });
    }

    if (!data.start_date) {
      errors.push({ field: 'start_date', message: 'Start date is required' });
    }

    if (!data.end_date) {
      errors.push({ field: 'end_date', message: 'End date is required' });
    }
  }

  // Field-specific validation
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (data.title.length > 200) {
      errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    }
  }

  // Total slots validation
  if (data.total_slots !== undefined) {
    if (!Number.isInteger(data.total_slots)) {
      errors.push({ field: 'total_slots', message: 'Total slots must be an integer' });
    } else if (data.total_slots < 1) {
      errors.push({ field: 'total_slots', message: 'Total slots must be at least 1' });
    }
  }

  // Date validation
  if (data.start_date !== undefined || data.end_date !== undefined) {
    const startDate = data.start_date ? new Date(data.start_date) : null;
    const endDate = data.end_date ? new Date(data.end_date) : null;

    if (data.start_date && (isNaN(startDate.getTime()))) {
      errors.push({ field: 'start_date', message: 'Invalid start date format' });
    }

    if (data.end_date && (isNaN(endDate.getTime()))) {
      errors.push({ field: 'end_date', message: 'Invalid end date format' });
    }

    // Date range validation (only if both dates are valid)
    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        errors.push({ field: 'end_date', message: 'End date must be after start date' });
      }
    }
  }

  // Status validation
  if (data.status !== undefined) {
    const validStatuses = ['open', 'full', 'closed'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ field: 'status', message: 'Status must be one of: open, full, closed' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate application data
 * @param {Object} data - Application data to validate
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validateApplicationData = (data) => {
  const errors = [];

  if (!data.position_id) {
    errors.push({ field: 'position_id', message: 'Position ID is required' });
  }

  if (!data.personal_statement || typeof data.personal_statement !== 'string' || data.personal_statement.trim() === '') {
    errors.push({ field: 'personal_statement', message: 'Personal statement is required and cannot be empty' });
  }

  if (!data.contact_info || typeof data.contact_info !== 'string' || data.contact_info.trim() === '') {
    errors.push({ field: 'contact_info', message: 'Contact information is required and cannot be empty' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user registration data
 * @param {Object} data - User registration data
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validateUserData = (data) => {
  const errors = [];

  // Username validation
  if (!data.username || typeof data.username !== 'string' || data.username.trim() === '') {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (data.username.length < 3 || data.username.length > 50) {
    errors.push({ field: 'username', message: 'Username must be between 3 and 50 characters' });
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' });
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Role validation
  const validRoles = ['student', 'teacher', 'enterprise'];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.push({ field: 'role', message: 'Role must be one of: student, teacher, enterprise' });
  }

  // Real name validation
  if (!data.real_name || typeof data.real_name !== 'string' || data.real_name.trim() === '') {
    errors.push({ field: 'real_name', message: 'Real name is required' });
  }

  // Phone validation (optional)
  if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone number format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate file upload
 * @param {Object} file - File object
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validateFileUpload = (file) => {
  const errors = [];
  const allowedTypes = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    errors.push({ field: 'file', message: 'File is required' });
    return { isValid: false, errors };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push({ field: 'file', message: 'File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG' });
  }

  if (file.size > maxSize) {
    errors.push({ field: 'file', message: 'File size exceeds 10MB limit' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate evaluation data
 * @param {Object} data - Evaluation data
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validateEvaluationData = (data) => {
  const errors = [];

  if (data.score === undefined || data.score === null) {
    errors.push({ field: 'score', message: 'Score is required' });
  } else if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
    errors.push({ field: 'score', message: 'Score must be a number between 0 and 100' });
  }

  if (!data.comment || typeof data.comment !== 'string' || data.comment.trim() === '') {
    errors.push({ field: 'comment', message: 'Comment is required and cannot be empty' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePositionData,
  validateApplicationData,
  validateUserData,
  validateFileUpload,
  validateEvaluationData
};
