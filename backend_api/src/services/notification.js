'use strict';

const { Notification } = require('../models');

let ioInstance = null;

/**
 * PUBLIC_INTERFACE
 * Initialize the notification service with a Socket.IO server reference.
 * This allows emitting real-time events to user-specific rooms.
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
function init(io) {
  /** Cache Socket.IO instance to emit notifications. */
  ioInstance = io;
}

/**
 * PUBLIC_INTERFACE
 * Create a notification and emit it to the recipient's Socket.IO room.
 * @param {Object} params
 * @param {string} params.user - Recipient user id
 * @param {string} params.actor - Actor user id
 * @param {'like'|'comment'|'follow'} params.type - Notification type
 * @param {string|null} [params.post] - Related post id
 * @param {string|null} [params.comment] - Related comment id
 * @param {Object} [params.metadata] - Arbitrary metadata
 * @returns {Promise<Object>} The created notification document
 */
async function notify({ user, actor, type, post = null, comment = null, metadata = {} }) {
  /** Create notification and emit to user's room if socket available. */
  const notification = await Notification.create({
    user,
    actor,
    type,
    post,
    comment,
    metadata,
  });

  if (ioInstance) {
    ioInstance.to(String(user)).emit('notification:new', {
      id: notification._id.toString(),
      type,
      actor: String(actor),
      post: post ? String(post) : null,
      comment: comment ? String(comment) : null,
      createdAt: notification.createdAt,
      isRead: false,
      metadata,
    });
  }
  return notification;
}

/**
 * PUBLIC_INTERFACE
 * List notifications for the given user, optionally only unread.
 * @param {string} userId - The user id
 * @param {{onlyUnread?: boolean, limit?: number}} [opts]
 * @returns {Promise<Array>} Array of notifications
 */
async function list(userId, { onlyUnread = false, limit = 20 } = {}) {
  /** List notifications for the user. */
  const filter = { user: userId };
  if (onlyUnread) filter.isRead = false;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('actor', '-passwordHash');
}

/**
 * PUBLIC_INTERFACE
 * Mark a single notification as read.
 * @param {string} userId - The user id
 * @param {string} notificationId - The notification id
 * @returns {Promise<Object>} Updated notification
 */
async function markRead(userId, notificationId) {
  /** Mark a notification as read. */
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!result) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  return result;
}

module.exports = {
  init,
  notify,
  list,
  markRead,
};
