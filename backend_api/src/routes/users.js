'use strict';

const express = require('express');
const { auth } = require('../middleware');
const controller = require('../controllers/users');

const router = express.Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 */
router.get('/search', auth(false), controller.search.bind(controller));

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile
 */
router.get('/:username', auth(false), controller.getProfile.bind(controller));

/**
 * @swagger
 * /users/me/profile:
 *   put:
 *     summary: Update my profile
 */
router.put('/me/profile', auth(true), controller.updateProfile.bind(controller));

module.exports = router;
