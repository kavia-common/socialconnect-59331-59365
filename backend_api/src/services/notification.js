'use strict';

const { Notification } = require('../models');

let ioInstance = null;

/**
 * Initialize the notification service with a Socket.IO server reference.
 * This will be set from server.js through app locals.
 */
// PUBLIC_INTERFACE
function init(io) {
  /** Cache Socket.IO instance to emit notifications. */
  ioInstance = io;
}

// PUBLIC_INTERFACE
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
      metadata,
    });
  }
  return notification;
}

// PUBLIC_INTERFACE
async function list(userId, { onlyUnread = false, limit = 20 } = {}) {
  /** List notifications for the user. */
  const filter = { user: userId };
  if (onlyUnread) filter.isRead = false;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('actor', '-passwordHash');
}

// PUBLIC_INTERFACE
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
