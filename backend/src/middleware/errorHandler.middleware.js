const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handler middleware
 * Catches all errors and formats them into consistent response structure
 * Filters sensitive information from client responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full details (server-side only)
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user.userId : 'unauthenticated',
    timestamp: new Date().toISOString(),
  });

  // Determine error type and status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An error occurred, please try again';
  let code = err.code || 'SERVER_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';

    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return ApiResponse.validationError(res, errors);
  }

  if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    code = 'DUPLICATE_RESOURCE';
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  if (err.name === 'UnauthorizedError') {
    // Authentication error
    statusCode = 401;
    message = 'Authentication required';
    code = 'AUTH_REQUIRED';
  }

  if (err.name === 'ForbiddenError') {
    // Authorization error
    statusCode = 403;
    message = 'Access denied';
    code = 'FORBIDDEN';
  }

  // Handle database connection errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    statusCode = 500;
    message = 'Database error occurred';
    code = 'DATABASE_ERROR';
    
    // Don't expose database details to client
    logger.error('Database error details:', err);
  }

  // For production, use generic error message for 500 errors
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An error occurred, please try again';
  }

  // Send error response (without sensitive information)
  return ApiResponse.error(res, statusCode, message, null, code);
};

/**
 * Handle 404 errors (route not found)
 */
const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  return ApiResponse.notFoundError(res, `Route ${req.method} ${req.path} not found`);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
