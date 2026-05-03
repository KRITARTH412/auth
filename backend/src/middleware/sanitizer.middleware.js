const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

/**
 * Sanitize inputs to prevent NoSQL injection
 * Simple sanitization that removes $ and . from keys
 */
const sanitizeInputs = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error('Sanitization middleware error:', error);
    next();
  }
};

/**
 * Additional custom sanitization middleware
 * Sanitizes request body, query, and params
 */
const customSanitize = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Sanitization middleware error:', error);
    next();
  }
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove keys that start with $ or contain .
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }

      const value = obj[key];

      if (typeof value === 'string') {
        // Remove null bytes
        sanitized[key] = value.replace(/\0/g, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

module.exports = {
  sanitizeInputs,
  customSanitize,
};
