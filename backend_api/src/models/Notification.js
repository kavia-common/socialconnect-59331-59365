'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true }, // recipient
    actor: { type: Types.ObjectId, ref: 'User', required: true, index: true }, // who triggered
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true, index: true },
    post: { type: Types.ObjectId, ref: 'Post', default: null, index: true },
    comment: { type: Types.ObjectId, ref: 'Comment', default: null, index: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Compound index to support list queries: user filter, unread filter, sorted by recency
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Secondary compound: user by type and recency (useful for categorization)
NotificationSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
