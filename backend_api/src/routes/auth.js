'use strict';

const express = require('express');
const controller = require('../controllers/auth');
const { auth, validate } = require('../middleware');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     description: Create a new user account.
 */
router.post(
  '/signup',
  validate([
    body('username').isString().trim().isLength({ min: 3, max: 30 }).withMessage('username 3-30 chars'),
    body('email').isString().trim().isEmail().withMessage('valid email required'),
    body('password').isString().isLength({ min: 8, max: 128 }).withMessage('password 8-128 chars'),
  ]),
  controller.signup.bind(controller)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Login with email or username and password.
 */
router.post(
  '/login',
  validate([
    body('emailOrUsername').isString().trim().isLength({ min: 1 }).withMessage('emailOrUsername required'),
    body('password').isString().isLength({ min: 8, max: 128 }).withMessage('password 8-128 chars'),
  ]),
  controller.login.bind(controller)
);

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
