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
 *     tags: [Follows]
 *     summary: Follow a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *     responses:
 *       201:
 *         description: Now following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowActionResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *     tags: [Follows]
 *     summary: Unfollow a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *     responses:
 *       200:
 *         description: Unfollowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *     tags: [Follows]
 *     summary: List followers of a user
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Followers list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *     tags: [Follows]
 *     summary: List following of a user
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Following list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
