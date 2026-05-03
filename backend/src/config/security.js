const helmet = require('helmet');
const cors = require('cors');

/**
 * Helmet security configuration
 * Sets various HTTP headers for security
 */
const helmetConfig = () => helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  xContentTypeOptions: true, // nosniff
  xFrameOptions: { action: 'deny' }, // DENY
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  xDownloadOptions: true,
  xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'no-referrer' },
});

/**
 * CORS configuration
 * Allows requests from specific origins
 */
const corsConfig = () => cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
});

module.exports = {
  helmetConfig,
  corsConfig,
};
