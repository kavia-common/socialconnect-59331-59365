'use strict';

const path = require('path');
const crypto = require('crypto');

// Ensure NODE_ENV=test for safety
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Provide safe defaults for required env vars
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-' + crypto.randomBytes(8).toString('hex');
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
process.env.MONGODB_DB = process.env.MONGODB_DB || 'socialconnect_test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
process.env.SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || '*';

// Cloudinary envs to exercise signature logic (non-secret dummy acceptable for tests)
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '123456';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'shhh-secret';

// Polyfill global fetch for Node if missing (Node 18+ has fetch)
if (typeof fetch === 'undefined') {
  // eslint-disable-next-line global-require
  global.fetch = require('node-fetch');
}

// Mock Cloudinary upload endpoint by intercepting fetch calls to api.cloudinary.com
const originalFetch = global.fetch;
global.fetch = async (url, opts) => {
  if (typeof url === 'string' && url.includes('api.cloudinary.com/v1_1/')) {
    // Return a plausible Cloudinary-like response
    return {
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => ({
        url: 'http://res.cloudinary.com/demo/image/upload/v12345/sample.jpg',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg',
        public_id: 'test_public_id',
        resource_type: 'image',
        type: 'upload',
        width: 100,
        height: 100,
        bytes: 12345,
        format: 'jpg',
      }),
      text: async () => JSON.stringify({ ok: true }),
    };
  }
  return originalFetch(url, opts);
};
