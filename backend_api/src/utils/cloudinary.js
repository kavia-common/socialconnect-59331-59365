'use strict';

const config = require('../config');
const crypto = require('crypto');

/**
 * Minimal Cloudinary utilities for signed uploads and direct server-side upload.
 * - getCloudinaryConfig: verify and expose env settings (non-secret)
 * - generateSignature: server-side signature for client uploads
 * - uploadToCloudinary: server-side direct upload using multipart/form-data
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

/**
 * PUBLIC_INTERFACE
 * Server-side direct upload using Cloudinary's upload API.
 * @param {Buffer} fileBuffer - File contents
 * @param {Object} opts - { folder?, public_id?, resource_type? ('image'|'video'|'auto'), tags? }
 * @returns {Promise<Object>} Cloudinary upload response
 */
async function uploadToCloudinary(fileBuffer, opts = {}) {
  /** Perform a multipart/form-data POST to Cloudinary upload endpoint. */
  const { cloudName, apiKey, hasSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !hasSecret) {
    const err = new Error('Cloudinary not configured on server');
    err.status = 500;
    throw err;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: opts.folder,
    public_id: opts.public_id,
    tags: opts.tags,
  };

  // Clean empty params
  Object.keys(paramsToSign).forEach((k) => {
    if (!paramsToSign[k]) delete paramsToSign[k];
  });

  const signature = generateSignature(paramsToSign);

  // Build multipart form
  // We avoid external deps by constructing multipart manually via FormData if available,
  // but Node lacks native FormData in older versions. Using fetch + form-data via undici is not guaranteed.
  // Instead, we'll use a simple boundary builder.
  const boundary = '----CloudinaryFormBoundary' + crypto.randomBytes(16).toString('hex');
  function part(name, value, filename, contentType) {
    let header = `--${boundary}\r\nContent-Disposition: form-data; name="${name}"`;
    if (filename) {
      header += `; filename="${filename}"`;
    }
    header += '\r\n';
    if (contentType) header += `Content-Type: ${contentType}\r\n`;
    header += '\r\n';
    return Buffer.from(header + (Buffer.isBuffer(value) ? '' : String(value)) + '\r\n');
  }
  const chunks = [];

  // Append text fields
  const appendField = (name, value) => {
    if (value === undefined || value === null || value === '') return;
    chunks.push(part(name, value));
  };

  appendField('timestamp', String(timestamp));
  if (paramsToSign.folder) appendField('folder', paramsToSign.folder);
  if (paramsToSign.public_id) appendField('public_id', paramsToSign.public_id);
  if (paramsToSign.tags) appendField('tags', paramsToSign.tags);
  appendField('api_key', config.cloudinary.apiKey);
  appendField('signature', signature);

  // File field
  const fileHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="upload"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const fileFooter = Buffer.from('\r\n');

  chunks.push(fileHeader, fileBuffer, fileFooter);

  // End boundary
  const end = Buffer.from(`--${boundary}--\r\n`);
  chunks.push(end);

  const body = Buffer.concat(chunks);

  const resourceType = opts.resource_type || 'auto';
  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${encodeURIComponent(
    resourceType
  )}/upload`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    let errDetail = '';
    try {
      errDetail = await res.text();
    } catch (_) {
      // ignore
    }
    const err = new Error(`Cloudinary upload failed: ${res.status} ${res.statusText} ${errDetail}`);
    err.status = 502;
    throw err;
  }
  return res.json();
}

module.exports = {
  getCloudinaryConfig,
  generateSignature,
  uploadToCloudinary,
};
