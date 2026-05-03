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
const corsConfig = () => {
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080',
  ].filter(Boolean);

  // Parse comma-separated origins if provided
  const parsedOrigins = allowedOrigins.flatMap(origin => 
    origin.includes(',') ? origin.split(',').map(o => o.trim()) : [origin]
  );

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = parsedOrigins.some(allowedOrigin => {
        if (allowedOrigin === '*') return true;
        return origin === allowedOrigin;
      });

      const isRenderSubdomain = origin.endsWith('.onrender.com');
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

      if (isAllowed || isRenderSubdomain || isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  });
};


module.exports = {
  helmetConfig,
  corsConfig,
};
