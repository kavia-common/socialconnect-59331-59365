'use strict';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const { initDatabase, disconnectDB } = require('../../src/config/db');
const config = require('../../src/config');

let mongoServer;

/**
 * Spin up an in-memory MongoDB instance and connect Mongoose.
 */
async function startTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  // ensure config reads updated env
  config.mongo.uri = uri;

  await initDatabase();
}

/**
 * Disconnect Mongoose and stop in-memory MongoDB.
 */
async function stopTestDB() {
  try {
    await disconnectDB();
  } catch (_) {
    // ignore
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

/**
 * Return express app, suitable for supertest.
 */
function getApp() {
  return app;
}

module.exports = {
  startTestDB,
  stopTestDB,
  getApp,
};
