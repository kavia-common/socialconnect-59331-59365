'use strict';

const express = require('express');
const { auth, validate } = require('../middleware');
const controller = require('../controllers/posts');
const { body, param, query } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  auth(true),
  validate([
    body('caption').optional().isString().isLength({ max: 2200 }),
    body('hashtags').optional().isArray().withMessage('hashtags must be array of strings'),
    body('hashtags.*').optional().isString().isLength({ max: 100 }),
    body('media').isObject().withMessage('media object required'),
    body('media.url').isString().isURL({ require_protocol: true }).withMessage('media.url must be a valid URL'),
    body('media.type').isIn(['image', 'video']).withMessage('media.type must be image or video'),
    body('media.publicId').optional().isString().isLength({ max: 200 }),
    body('media.width').optional().isInt({ min: 1, max: 10000 }),
    body('media.height').optional().isInt({ min: 1, max: 10000 }),
    body('media.duration').optional().isFloat({ min: 0, max: 36000 }),
  ]),
  controller.create.bind(controller)
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete my post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       200:
 *         description: Delete result
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
  '/:id',
  auth(true),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.remove.bind(controller)
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by id
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       200:
 *         description: Post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  auth(false),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.getById.bind(controller)
);

/**
 * @swagger
 * /posts/by/{username}:
 *   get:
 *     tags: [Posts]
 *     summary: List posts by username
 *     parameters:
 *       - $ref: '#/components/parameters/UsernameParam'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Posts by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/by/:username',
  auth(false),
  validate([
    param('username').isString().trim().isLength({ min: 3, max: 30 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  controller.listByUser.bind(controller)
);

/**
 * @swagger
 * /posts/feed/me:
 *   get:
 *     tags: [Posts]
 *     summary: My feed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Feed posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/feed/me',
  auth(true),
  validate([query('limit').optional().isInt({ min: 1, max: 100 }).toInt()]),
  controller.feed.bind(controller)
);

/**
 * @swagger
 * /posts/explore:
 *   get:
 *     tags: [Posts]
 *     summary: Explore posts
 *     parameters:
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Public posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get(
  '/explore',
  auth(false),
  validate([query('limit').optional().isInt({ min: 1, max: 100 }).toInt()]),
  controller.explore.bind(controller)
);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     tags: [Posts]
 *     summary: Search posts
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
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
 * /posts/{id}/comments:
 *   post:
 *     tags: [Posts]
 *     summary: Comment on a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/comments',
  auth(true),
  validate([
    param('id').isString().isLength({ min: 1 }),
    body('text').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('text 1-1000 chars'),
    body('parentComment').optional().isString().isLength({ min: 1 }),
  ]),
  controller.comment.bind(controller)
);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like a post
 *     description: Likes the specified post. Idempotent; multiple calls will not increase likeCount beyond one per user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       201:
 *         description: Like applied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Posts]
 *     summary: Unlike a post
 *     description: Removes the user's like from the post. Idempotent; if not liked, it is a no-op.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PostIdParam'
 *     responses:
 *       200:
 *         description: Unlike result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnlikeResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/like',
  auth(true),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.like.bind(controller)
);
router.delete(
  '/:id/like',
  auth(true),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.unlike.bind(controller)
);

module.exports = router;
