'use strict';

const express = require('express');
const multer = require('multer');
const { auth, validate } = require('../middleware');
const controller = require('../controllers/media');
const { body } = require('express-validator');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @swagger
 * /media/signature:
 *   post:
 *     tags:
 *       - Media
 *     summary: Get signed Cloudinary upload payload
 *     description: Returns a signature and parameters for direct client-side upload to Cloudinary.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaSignatureRequest'
 *     responses:
 *       200:
 *         description: Signed payload and public Cloudinary info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaSignatureResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/signature',
  auth(true),
  validate([
    body('folder').optional().isString().isLength({ max: 200 }),
    body('timestamp').optional().isInt({ min: 0 }).toInt(),
    body('public_id').optional().isString().isLength({ max: 200 }),
    body('tags').optional().isString().isLength({ max: 500 }),
    body('resource_type').optional().isIn(['image', 'video', 'auto']),
    body('eager').optional().isString().isLength({ max: 500 }),
  ]),
  controller.getSignedPayload.bind(controller)
);

/**
 * @swagger
 * /media/upload:
 *   post:
 *     tags:
 *       - Media
 *     summary: Server-side upload to Cloudinary
 *     description: Accepts multipart/form-data with media file and uploads to Cloudinary on the server-side.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload
 *               folder:
 *                 type: string
 *               public_id:
 *                 type: string
 *               resource_type:
 *                 type: string
 *                 enum: [image, video, auto]
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUploadResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/upload',
  auth(true),
  upload.single('file'),
  validate([
    body('folder').optional().isString().isLength({ max: 200 }),
    body('public_id').optional().isString().isLength({ max: 200 }),
    body('resource_type').optional().isIn(['image', 'video', 'auto']),
    body('tags').optional().isString().isLength({ max: 500 }),
  ]),
  controller.uploadServer.bind(controller)
);

module.exports = router;
