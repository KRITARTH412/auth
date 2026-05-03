/**
 * Application constants
 */

module.exports = {
  // User roles
  ROLES: {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
  },

  // Token types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
  },

  // Cookie names
  COOKIES: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },

  // Cookie options
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  },

  // Rate limit windows (in milliseconds)
  RATE_LIMITS: {
    LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
    LOGIN_MAX_REQUESTS: 5,
    REGISTER_WINDOW: 60 * 60 * 1000, // 1 hour
    REGISTER_MAX_REQUESTS: 3,
  },

  // Error messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    AUTH_REQUIRED: 'Authentication required',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    VALIDATION_FAILED: 'Validation failed',
    SERVER_ERROR: 'An error occurred, please try again',
  },

  // Success messages
  SUCCESS: {
    REGISTRATION: 'User registered successfully',
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
  },

  // Validation limits
  VALIDATION: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    PASSWORD_MIN: 8,
    STRING_MAX: 1000,
  },
};
