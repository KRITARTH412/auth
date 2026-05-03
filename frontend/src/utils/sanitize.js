import DOMPurify from 'dompurify';

/**
 * Sanitize user-generated content before rendering
 * @param {string} dirty - Potentially unsafe HTML string
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

/**
 * Sanitize text content (removes all HTML)
 * @param {string} text - Text to sanitize
 * @returns {string} Plain text without HTML
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize user input for display
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeUserInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all HTML tags and scripts
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeUserInput,
};
