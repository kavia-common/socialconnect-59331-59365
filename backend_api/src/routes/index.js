const express = require('express');
const healthController = require('../controllers/health');
const { auth } = require('../middleware');

const authRoutes = require('./auth');
const usersRoutes = require('./users');
const postsRoutes = require('./posts');
const followsRoutes = require('./follows');
const notificationsRoutes = require('./notifications');
const mediaRoutes = require('./media');

const router = express.Router();
// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     description: Returns service health information.
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /auth/ping:
 *   get:
 *     tags: [Auth]
 *     summary: Authenticated ping
 *     description: Returns a simple payload if JWT is valid.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auth OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/auth/ping', auth(true), (req, res) => {
  return res.json({ ok: true, user: req.user });
});

// Mount feature routers
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
router.use('/follows', followsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/media', mediaRoutes);

module.exports = router;
