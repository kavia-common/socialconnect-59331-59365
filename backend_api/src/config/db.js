'use strict';

const mongoose = require('mongoose');
const config = require('./index');
const models = require('../models');

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
 * Ensure indexes for all registered models.
 * Explicitly calls createIndexes() (alias ensureIndexes) to build declared schema indexes.
 */
async function ensureAllIndexes() {
  const modelEntries = Object.entries(models);
  for (const [name, model] of modelEntries) {
    try {
      // createIndexes builds declared indexes without dropping existing ones
      await model.createIndexes();
      console.log(`Indexes ensured for model: ${name}`);
    } catch (err) {
      console.error(`Failed to ensure indexes for model ${name}:`, err.message);
    }
  }
}

/**
 * Disconnect from MongoDB.
 */
async function disconnectDB() {
  await mongoose.disconnect();
}

/**
 * PUBLIC_INTERFACE
 * Initialize database connection (idempotent) and ensure indexes are created.
 */
async function initDatabase() {
  /** Initialize Mongoose connection and enforce indexes. */
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  await ensureAllIndexes();
}

module.exports = {
  initDatabase,
  disconnectDB,
};
