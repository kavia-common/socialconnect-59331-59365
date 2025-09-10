'use strict';

const express = require('express');
const { auth } = require('../middleware');
const controller = require('../controllers/follows');

const router = express.Router();

/**
 * @swagger
 * /follows/{username}:
 *   post:
 *     summary: Follow a user
 */
router.post('/:username', auth(true), controller.follow.bind(controller));

/**
 * @swagger
 * /follows/{username}:
 *   delete:
 *     summary: Unfollow a user
 */
router.delete('/:username', auth(true), controller.unfollow.bind(controller));

/**
 * @swagger
 * /follows/{username}/followers:
 *   get:
 *     summary: List followers of a user
 */
router.get('/:username/followers', auth(false), controller.followers.bind(controller));

/**
 * @swagger
 * /follows/{username}/following:
 *   get:
 *     summary: List following of a user
 */
router.get('/:username/following', auth(false), controller.following.bind(controller));

module.exports = router;
