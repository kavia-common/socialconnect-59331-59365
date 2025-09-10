'use strict';

const express = require('express');
const { auth, validate } = require('../middleware');
const controller = require('../controllers/notifications');
const { query, param } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/OnlyUnreadQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  auth(true),
  validate([
    query('onlyUnread').optional().isIn(['0', '1']).withMessage('onlyUnread must be "0" or "1"'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  controller.list.bind(controller)
);

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationIdParam'
 *     responses:
 *       200:
 *         description: Updated notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/read',
  auth(true),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.markRead.bind(controller)
);

module.exports = router;
