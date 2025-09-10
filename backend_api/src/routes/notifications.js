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
 *     summary: List notifications
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
 *     summary: Mark notification as read
 */
router.post(
  '/:id/read',
  auth(true),
  validate([param('id').isString().isLength({ min: 1 })]),
  controller.markRead.bind(controller)
);

module.exports = router;
