'use strict';

const express = require('express');
const { auth, validate } = require('../middleware');
const controller = require('../controllers/follows');
const { param, query } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /follows/{username}:
 *   post:
 *     summary: Follow a user
 */
router.post(
  '/:username',
  auth(true),
  validate([param('username').isString().trim().isLength({ min: 3, max: 30 })]),
  controller.follow.bind(controller)
);

/**
 * @swagger
 * /follows/{username}:
 *   delete:
 *     summary: Unfollow a user
 */
router.delete(
  '/:username',
  auth(true),
  validate([param('username').isString().trim().isLength({ min: 3, max: 30 })]),
  controller.unfollow.bind(controller)
);

/**
 * @swagger
 * /follows/{username}/followers:
 *   get:
 *     summary: List followers of a user
 */
router.get(
  '/:username/followers',
  auth(false),
  validate([
    param('username').isString().trim().isLength({ min: 3, max: 30 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  controller.followers.bind(controller)
);

/**
 * @swagger
 * /follows/{username}/following:
 *   get:
 *     summary: List following of a user
 */
router.get(
  '/:username/following',
  auth(false),
  validate([
    param('username').isString().trim().isLength({ min: 3, max: 30 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  controller.following.bind(controller)
);

module.exports = router;
