/**
 * Standardized API response utility
 */

class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {Object} data - Response data
   */
  static success(res, statusCode = 200, message = 'Success', data = null) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      Object.assign(response, data);
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Array of error objects
   * @param {string} code - Error code
   */
  static error(res, statusCode = 500, message = 'An error occurred', errors = null, code = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    if (code) {
      response.code = code;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Array of validation error objects
   */
  static validationError(res, errors) {
    return this.error(res, 400, 'Validation failed', errors, 'VALIDATION_ERROR');
  }

  /**
   * Authentication error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static authError(res, message = 'Authentication required') {
    return this.error(res, 401, message, null, 'AUTH_ERROR');
  }

  /**
   * Authorization error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbiddenError(res, message = 'Access denied') {
    return this.error(res, 403, message, null, 'FORBIDDEN');
  }

  /**
   * Not found error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static notFoundError(res, message = 'Resource not found') {
    return this.error(res, 404, message, null, 'NOT_FOUND');
  }

  /**
   * Conflict error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static conflictError(res, message = 'Resource already exists') {
    return this.error(res, 409, message, null, 'CONFLICT');
  }

  /**
   * Rate limit error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static rateLimitError(res, message = 'Too many requests, please try again later') {
    return this.error(res, 429, message, null, 'RATE_LIMIT_EXCEEDED');
  }

  /**
   * Server error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static serverError(res, message = 'An error occurred, please try again') {
    return this.error(res, 500, message, null, 'SERVER_ERROR');
  }
}

module.exports = ApiResponse;
