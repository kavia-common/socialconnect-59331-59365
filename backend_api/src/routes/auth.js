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
 *     tags: [Auth]
 *     summary: User signup
 *     description: Create a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenUser'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User with email/username already exists
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
 *     tags: [Auth]
 *     summary: User login
 *     description: Login with email or username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Auth OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenUser'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 *     tags: [Auth]
 *     summary: Current user
 *     description: Returns the current user profile for a valid JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', auth(true), controller.me.bind(controller));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Stateless logout - client should discard the token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout acknowledged
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
 */
router.post('/logout', auth(true), controller.logout.bind(controller));

module.exports = router;
