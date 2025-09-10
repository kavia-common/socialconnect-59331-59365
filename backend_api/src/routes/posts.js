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
 *     summary: Create post
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
 *     summary: Delete my post
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
 *     summary: Get post by id
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
 *     summary: List posts by username
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
 *     summary: My feed
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
 *     summary: Explore posts
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
 *     summary: Search posts
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
 *     summary: Comment on a post
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
 *     summary: Like a post
 *     description: Likes the specified post. Idempotent; multiple calls will not increase likeCount beyond one per user.
 *   delete:
 *     summary: Unlike a post
 *     description: Removes the user's like from the post. Idempotent; if not liked, it is a no-op.
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
