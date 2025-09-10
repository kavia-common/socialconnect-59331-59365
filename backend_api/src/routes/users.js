'use strict';

const express = require('express');
const { auth, validate } = require('../middleware');
const controller = require('../controllers/users');
const { query, param, body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Users found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  '/search',
  auth(false),
  validate([
    query('q').isString().trim().isLength({ min: 1 }).withMessage('q required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  controller.search.bind(controller)
);

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *     responses:
 *       200:
 *         description: Public profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicProfile'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:username',
  auth(false),
  validate([param('username').isString().trim().isLength({ min: 3, max: 30 })]),
  controller.getProfile.bind(controller)
);

/**
 * @swagger
 * /users/me/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update my profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/me/profile',
  auth(true),
  validate([
    body('bio').optional().isString().isLength({ max: 1600 }),
    body('avatarUrl').optional().isString().isURL({ require_protocol: true }),
    body('username').optional().isString().trim().isLength({ min: 3, max: 30 }),
  ]),
  controller.updateProfile.bind(controller)
);

module.exports = router;
