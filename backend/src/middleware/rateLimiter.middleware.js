const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Rate limiter for login endpoint
 * Limits: 5 requests per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN_WINDOW,
  max: RATE_LIMITS.LOGIN_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    });
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * Rate limiter for registration endpoint
 * Limits: 3 requests per hour per IP
 */
const registerLimiter = rateLimit({
  windowMs: RATE_LIMITS.REGISTER_WINDOW,
  max: RATE_LIMITS.REGISTER_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for registration from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    });
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
};
