'use strict';

const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB using Mongoose.
 * Handles connection events and graceful shutdown.
 */
async function connectDB() {
  const { uri, dbName } = config.mongo;

  // Configure mongoose options for robust connection
  const mongooseOpts = {
    dbName,
    autoIndex: true,
  };

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected to ${uri}/${dbName}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(uri, mongooseOpts);
}

/**
 * Disconnect from MongoDB.
 */
async function disconnectDB() {
  await mongoose.disconnect();
}

/**
 * PUBLIC_INTERFACE
 * Initialize database connection (idempotent).
 */
async function initDatabase() {
  /** Initialize Mongoose connection. */
  if (mongoose.connection.readyState === 1) return;
  await connectDB();
}

module.exports = {
  initDatabase,
  disconnectDB,
};
