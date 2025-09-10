'use strict';

const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware');
const controller = require('../controllers/media');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @swagger
 * /media/signature:
 *   post:
 *     summary: Get signed Cloudinary upload payload
 *     description: Returns a signature and parameters for direct client-side upload to Cloudinary.
 *     tags:
 *       - Media
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folder:
 *                 type: string
 *                 description: Optional Cloudinary folder path
 *               timestamp:
 *                 type: integer
 *                 description: Unix timestamp (seconds). Defaults to now.
 *               public_id:
 *                 type: string
 *                 description: Optional public id for the asset
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               resource_type:
 *                 type: string
 *                 enum: [image, video, auto]
 *                 description: Resource type (default auto)
 *               eager:
 *                 type: string
 *                 description: Eager transformation string
 *     responses:
 *       200:
 *         description: Signed payload and public Cloudinary info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cloudName:
 *                   type: string
 *                 apiKey:
 *                   type: string
 *                 timestamp:
 *                   type: integer
 *                 signature:
 *                   type: string
 *                 payload:
 *                   type: object
 */
router.post('/signature', auth(true), controller.getSignedPayload.bind(controller));

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Server-side upload to Cloudinary
 *     description: Accepts multipart/form-data with media file and uploads to Cloudinary on the server-side.
 *     tags:
 *       - Media
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
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 secureUrl:
 *                   type: string
 *                 publicId:
 *                   type: string
 *                 resourceType:
 *                   type: string
 *                 type:
 *                   type: string
 *                 width:
 *                   type: integer
 *                 height:
 *                   type: integer
 *                 duration:
 *                   type: number
 *                 bytes:
 *                   type: integer
 *                 format:
 *                   type: string
 */
router.post('/upload', auth(true), upload.single('file'), controller.uploadServer.bind(controller));

module.exports = router;
