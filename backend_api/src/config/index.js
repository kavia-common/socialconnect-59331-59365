'use strict';

/**
 * Loads environment variables and exposes app configuration.
 * Ensures variables are parsed once at startup.
 */
const dotenv = require('dotenv');

dotenv.config();

const toArray = (csv) =>
  (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const config = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || '',
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'socialconnect',
  },
  cors: {
    origins: toArray(process.env.CORS_ORIGIN || '*'),
  },
  socket: {
    origins: toArray(process.env.SOCKET_CORS_ORIGIN || '*'),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};

module.exports = config;
