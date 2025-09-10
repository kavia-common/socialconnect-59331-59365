'use strict';

const notificationService = require('../services/notification');

/**
 * NotificationsController handles listing and marking notifications as read.
 */
class NotificationsController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** List notifications for current user, accepts ?onlyUnread=1&limit=20 */
    try {
      const onlyUnread = String(req.query.onlyUnread || '0') === '1';
      const items = await notificationService.list(req.user.sub, {
        onlyUnread,
        limit: req.query.limit || 20,
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async markRead(req, res, next) {
    /** Mark a single notification as read by :id */
    try {
      const item = await notificationService.markRead(req.user.sub, req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationsController();
