const validator = require('validator');

class ValidationService {
  constructor() {
    // RFC 5322 compliant email regex (simplified version)
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Password must contain: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    
    // Username: 3-30 chars, alphanumeric and underscore only
    this.usernameRegex = /^[a-zA-Z0-9_]+$/;
  }

  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} {isValid: boolean, missingFields: Array<string>}
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {Object} {isValid: boolean, message: string}
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }

    const trimmedEmail = email.trim();

    if (!this.emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Additional validation using validator library
    if (!validator.isEmail(trimmedEmail)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate password complexity
   * @param {string} password - Password
   * @returns {Object} {isValid: boolean, message: string, failedRules: Array<string>}
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        message: 'Password is required',
        failedRules: ['required'],
      };
    }

    const failedRules = [];

    // Check minimum length
    if (password.length < 8) {
      failedRules.push('minimum 8 characters');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      failedRules.push('at least one lowercase letter');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      failedRules.push('at least one uppercase letter');
    }

    // Check for number
    if (!/\d/.test(password)) {
      failedRules.push('at least one number');
    }

    // Check for special character
    if (!/[@$!%*?&]/.test(password)) {
      failedRules.push('at least one special character (@$!%*?&)');
    }

    const isValid = failedRules.length === 0;
    const message = isValid
      ? ''
      : `Password must contain: ${failedRules.join(', ')}`;

    return { isValid, message, failedRules };
  }

  /**
   * Validate username
   * @param {string} username - Username
   * @returns {Object} {isValid: boolean, message: string}
   */
  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { isValid: false, message: 'Username is required' };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters' };
    }

    if (trimmedUsername.length > 30) {
      return { isValid: false, message: 'Username cannot exceed 30 characters' };
    }

    if (!this.usernameRegex.test(trimmedUsername)) {
      return {
        isValid: false,
        message: 'Username can only contain letters, numbers, and underscores',
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Sanitize input string
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Escape special characters for XSS prevention
    sanitized = validator.escape(sanitized);

    // Remove SQL injection patterns
    sanitized = sanitized.replace(/('|(--)|;|\/\*|\*\/|xp_|sp_)/gi, '');

    return sanitized;
  }

  /**
   * Trim and limit string length
   * @param {string} input - Input string
   * @param {number} maxLength - Maximum length
   * @returns {string} Trimmed and limited string
   */
  trimAndLimit(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const trimmed = input.trim();
    return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
  }

  /**
   * Validate registration data
   * @param {Object} data - Registration data {username, email, password}
   * @returns {Object} {isValid: boolean, errors: Array<Object>}
   */
  validateRegistration(data) {
    const errors = [];

    // Check required fields
    const requiredCheck = this.validateRequiredFields(data, ['username', 'email', 'password']);
    if (!requiredCheck.isValid) {
      requiredCheck.missingFields.forEach((field) => {
        errors.push({ field, message: `${field} is required` });
      });
      return { isValid: false, errors };
    }

    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.push({ field: 'username', message: usernameValidation.message });
    }

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push({ field: 'email', message: emailValidation.message });
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.message });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate login data
   * @param {Object} data - Login data {identifier, password}
   * @returns {Object} {isValid: boolean, errors: Array<Object>}
   */
  validateLogin(data) {
    const errors = [];

    // Check required fields
    const requiredCheck = this.validateRequiredFields(data, ['identifier', 'password']);
    if (!requiredCheck.isValid) {
      requiredCheck.missingFields.forEach((field) => {
        errors.push({ field, message: `${field} is required` });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize object fields
   * @param {Object} data - Data object
   * @param {Array<string>} fields - Fields to sanitize
   * @returns {Object} Sanitized data object
   */
  sanitizeObject(data, fields) {
    const sanitized = { ...data };

    fields.forEach((field) => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = this.sanitizeInput(sanitized[field]);
      }
    });

    return sanitized;
  }
}

module.exports = new ValidationService();
