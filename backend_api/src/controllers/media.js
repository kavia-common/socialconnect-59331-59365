'use strict';

const { generateSignature, getCloudinaryConfig, uploadToCloudinary } = require('../utils/cloudinary');

/**
 * MediaController handles Cloudinary uploads and signing operations.
 */
class MediaController {
  // PUBLIC_INTERFACE
  async getSignedPayload(req, res, next) {
    /**
     * Generate a signed payload for direct client uploads to Cloudinary.
     * Body: {
     *   folder?: string,
     *   timestamp?: number, // defaults to now
     *   public_id?: string,
     *   tags?: string, // comma-separated tags
     *   resource_type?: 'image' | 'video' | 'auto', // default 'auto'
     *   eager?: string // optional eager transformations string
     * }
     * Returns: { cloudName, apiKey, timestamp, signature, payload }
     */
    try {
      const cfg = getCloudinaryConfig();
      if (!cfg.cloudName || !cfg.apiKey || !cfg.hasSecret) {
        const err = new Error('Cloudinary not configured on server');
        err.status = 500;
        throw err;
      }

      const {
        folder,
        timestamp,
        public_id,
        tags,
        resource_type = 'auto',
        eager,
      } = req.body || {};

      const ts = Number(timestamp) || Math.floor(Date.now() / 1000);

      // Validate basic inputs
      const isSafeStr = (s) =>
        typeof s === 'string' &&
        s.length <= 200 &&
        !s.includes('..') &&
        !/[^\w\-\/,.:]/.test(s.replace(/[,/]/g, ''));

      if (folder && !isSafeStr(folder)) {
        const err = new Error('Invalid folder');
        err.status = 400;
        throw err;
      }
      if (public_id && !isSafeStr(public_id)) {
        const err = new Error('Invalid public_id');
        err.status = 400;
        throw err;
      }
      if (tags && typeof tags !== 'string') {
        const err = new Error('Invalid tags');
        err.status = 400;
        throw err;
      }
      if (!['image', 'video', 'auto'].includes(resource_type)) {
        const err = new Error('Invalid resource_type');
        err.status = 400;
        throw err;
      }

      // Construct params to sign as per Cloudinary spec
      const paramsToSign = {
        timestamp: ts,
        folder,
        public_id,
        tags,
        resource_type, // note: cloudinary signs only upload params; resource_type isn't always in signature but keeping for completeness
        eager,
      };

      // Clean undefined prior to signing
      Object.keys(paramsToSign).forEach((k) => {
        if (paramsToSign[k] === undefined || paramsToSign[k] === null || paramsToSign[k] === '') {
          delete paramsToSign[k];
        }
      });

      const signature = generateSignature(paramsToSign);

      return res.json({
        cloudName: cfg.cloudName,
        apiKey: cfg.apiKey,
        timestamp: ts,
        signature,
        payload: paramsToSign,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async uploadServer(req, res, next) {
    /**
     * Server-side upload to Cloudinary.
     * Expects multipart/form-data with:
     *  - file: binary image/video
     *  - folder?: string
     *  - public_id?: string
     *  - resource_type?: 'image' | 'video' | 'auto'
     *  - tags?: string (comma separated)
     *
     * Returns: { url, secureUrl, publicId, resourceType, type, width?, height?, duration? }
     */
    try {
      const file = req.file;
      const { folder, public_id, resource_type = 'auto', tags } = req.body || {};

      if (!file) {
        const err = new Error('file is required');
        err.status = 400;
        throw err;
      }

      const isSafeStr = (s) =>
        typeof s === 'string' &&
        s.length <= 200 &&
        !s.includes('..') &&
        !/[^\w\-\/,.:]/.test(s.replace(/[,/]/g, ''));

      if (folder && !isSafeStr(folder)) {
        const err = new Error('Invalid folder');
        err.status = 400;
        throw err;
      }
      if (public_id && !isSafeStr(public_id)) {
        const err = new Error('Invalid public_id');
        err.status = 400;
        throw err;
      }
      if (!['image', 'video', 'auto'].includes(resource_type)) {
        const err = new Error('Invalid resource_type');
        err.status = 400;
        throw err;
      }
      if (tags && typeof tags !== 'string') {
        const err = new Error('Invalid tags');
        err.status = 400;
        throw err;
      }

      // Upload using our util
      const uploaded = await uploadToCloudinary(file.buffer, {
        folder,
        public_id,
        resource_type,
        tags,
      });

      const response = {
        url: uploaded.url,
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        type: uploaded.type,
        width: uploaded.width,
        height: uploaded.height,
        duration: uploaded.duration,
        bytes: uploaded.bytes,
        format: uploaded.format,
      };

      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MediaController();
