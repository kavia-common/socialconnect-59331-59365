const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const config = require('./config');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize express app
const app = express();

// Security headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Keep simple for Swagger/Socket compatibility by default
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
const corsOrigins = config.cors.origins.length ? config.cors.origins : ['*'];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.set('trust proxy', true);

// Global rate limiting: basic protection for abusive clients
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// Swagger docs with dynamic server
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.secure ? 'https' : req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));

  const fullHost = needsPort ? `${host}:${actualPort}` : host;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [{ url: `${protocol}://${fullHost}` }],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Body parsers with explicit limits to avoid abuse
app.use(express.json({ limit: '1mb', strict: true })); // reduce default to 1mb
app.use(express.urlencoded({ extended: false, limit: '1mb' })); // url-encoded also limited
app.use(cookieParser());

// Mount routes
app.use('/', routes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.originalUrl,
  });
});

/**
 * Global error handling middleware.
 * Formats errors consistently and hides internal details in production.
 */
app.use((err, req, res, next) => {
  // Fallbacks
  const status = err.status || err.statusCode || 500;
  const isProd = (config.env || 'development') === 'production';

  // Log server errors (avoid noisy logs for 4xx)
  if (status >= 500) {
    console.error(err.stack || err);
  }

  const response = {
    status: 'error',
    message: err.message || 'Internal Server Error',
  };

  // Include basic validation/body parse error info in non-prod
  if (!isProd && err.type === 'entity.too.large') {
    response.message = 'Payload too large';
  }

  // Optionally include details in non-production for debugging
  if (!isProd && err.details) {
    response.details = err.details;
  }

  res.status(status).json(response);
});

module.exports = app;
