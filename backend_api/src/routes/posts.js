'use strict';

const express = require('express');
const { auth } = require('../middleware');
const controller = require('../controllers/posts');

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create post
 */
router.post('/', auth(true), controller.create.bind(controller));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete my post
 */
router.delete('/:id', auth(true), controller.remove.bind(controller));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by id
 */
router.get('/:id', auth(false), controller.getById.bind(controller));

/**
 * @swagger
 * /posts/by/{username}:
 *   get:
 *     summary: List posts by username
 */
router.get('/by/:username', auth(false), controller.listByUser.bind(controller));

/**
 * @swagger
 * /posts/feed/me:
 *   get:
 *     summary: My feed
 */
router.get('/feed/me', auth(true), controller.feed.bind(controller));

/**
 * @swagger
 * /posts/explore:
 *   get:
 *     summary: Explore posts
 */
router.get('/explore', auth(false), controller.explore.bind(controller));

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts
 */
router.get('/search', auth(false), controller.search.bind(controller));

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Comment on a post
 */
router.post('/:id/comments', auth(true), controller.comment.bind(controller));

module.exports = router;
