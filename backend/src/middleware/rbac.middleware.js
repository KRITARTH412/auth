const ApiResponse = require('../utils/apiResponse');
const { ERRORS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Creates middleware that checks if authenticated user has required role
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        logger.warn('Authorization failed: User not authenticated');
        return ApiResponse.authError(res, ERRORS.AUTH_REQUIRED);
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Authorization failed: User ${req.user.userId} with role ${req.user.role} attempted to access route requiring roles: ${allowedRoles.join(', ')}`
        );
        return ApiResponse.forbiddenError(res, ERRORS.INSUFFICIENT_PERMISSIONS);
      }

      logger.debug(`User ${req.user.userId} authorized with role ${req.user.role}`);
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      return ApiResponse.serverError(res);
    }
  };
};

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user is admin or moderator
 */
const isAdminOrModerator = authorize('admin', 'moderator');

module.exports = { authorize, isAdmin, isAdminOrModerator };
