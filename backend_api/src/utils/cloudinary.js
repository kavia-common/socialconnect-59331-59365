'use strict';

const config = require('../config');
const crypto = require('crypto');

/**
 * Minimal Cloudinary signed upload utility using the REST API.
 * Note: Client will typically upload using unsigned preset. For backend signed upload,
 * generate signature and return credentials for client or use direct backend upload.
 * This helper provides signature generation for secure uploads if needed.
 */

// PUBLIC_INTERFACE
function getCloudinaryConfig() {
  /** Returns Cloudinary config for current environment (for diagnostics). */
  const { cloudName, apiKey } = config.cloudinary;
  return { cloudName, apiKey, hasSecret: !!config.cloudinary.apiSecret };
}

/**
 * PUBLIC_INTERFACE
 * Generate Cloudinary signature for the given params (excluding file bytes).
 * paramsToSign should be an object without the 'signature' key.
 */
function generateSignature(paramsToSign) {
  /** Create a Cloudinary signature for secure uploads. */
  const apiSecret = config.cloudinary.apiSecret;
  if (!apiSecret) throw new Error('CLOUDINARY_API_SECRET is not configured');

  const sorted = Object.keys(paramsToSign)
    .filter((k) => paramsToSign[k] !== undefined && paramsToSign[k] !== null && paramsToSign[k] !== '')
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&');

  const toSign = `${sorted}${apiSecret ? apiSecret : ''}`;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

module.exports = {
  getCloudinaryConfig,
  generateSignature,
};
