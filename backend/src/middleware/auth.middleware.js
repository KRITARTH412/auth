const tokenService = require('../services/token.service');
const ApiResponse = require('../utils/apiResponse');
const { COOKIES, ERRORS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token from HTTP-only cookie and attaches user data to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract JWT token from HTTP-only cookie
    const token = req.cookies[COOKIES.ACCESS_TOKEN];

    // Check if token exists
    if (!token) {
      logger.warn('Authentication failed: No token provided');
      return ApiResponse.authError(res, ERRORS.AUTH_REQUIRED);
    }

    // Verify token signature and expiration
    try {
      const decoded = tokenService.verifyToken(token, 'access');

      // Attach user data to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };

      logger.debug(`User authenticated: ${decoded.userId}`);
      next();
    } catch (error) {
      // Handle different token error types
      if (error.message === 'Token expired') {
        logger.warn('Authentication failed: Token expired');
        return ApiResponse.authError(res, ERRORS.TOKEN_EXPIRED);
      } else if (error.message === 'Invalid token') {
        logger.warn('Authentication failed: Invalid token');
        return ApiResponse.authError(res, ERRORS.INVALID_TOKEN);
      } else {
        logger.error('Authentication error:', error);
        return ApiResponse.authError(res, ERRORS.INVALID_TOKEN);
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return ApiResponse.serverError(res);
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIES.ACCESS_TOKEN];

    if (token) {
      try {
        const decoded = tokenService.verifyToken(token, 'access');
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (error) {
        // Token is invalid or expired, but we don't fail the request
        logger.debug('Optional auth: Invalid or expired token');
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = { authenticate, optionalAuth };
