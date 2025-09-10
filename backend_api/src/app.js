const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const config = require('./config');

// Initialize express app
const app = express();

// CORS
const corsOrigins = config.cors.origins.length ? config.cors.origins : ['*'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.set('trust proxy', true);

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

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes
app.use('/', routes);

/**
 * Global error handling middleware.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
