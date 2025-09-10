'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true }, // recipient
    actor: { type: Types.ObjectId, ref: 'User', required: true }, // who triggered
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true, index: true },
    post: { type: Types.ObjectId, ref: 'Post', default: null },
    comment: { type: Types.ObjectId, ref: 'Comment', default: null },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
