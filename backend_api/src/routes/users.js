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
 *     summary: Search users
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
 *     summary: Get user profile
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
 *     summary: Update my profile
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
