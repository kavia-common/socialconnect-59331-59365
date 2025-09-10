'use strict';

const express = require('express');
const { auth } = require('../middleware');
const controller = require('../controllers/notifications');

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List notifications
 */
router.get('/', auth(true), controller.list.bind(controller));

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 */
router.post('/:id/read', auth(true), controller.markRead.bind(controller));

module.exports = router;
