'use strict';

const express = require('express');
const controller = require('../controllers/auth');
const { auth } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     description: Create a new user account.
 */
router.post('/signup', controller.signup.bind(controller));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Login with email or username and password.
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Current user
 *     description: Returns the current user profile for a valid JWT.
 */
router.get('/me', auth(true), controller.me.bind(controller));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Stateless logout - client should discard the token.
 */
router.post('/logout', auth(true), controller.logout.bind(controller));

module.exports = router;
