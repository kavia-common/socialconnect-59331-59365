'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/**
 * Follow relationship between users.
 * follower -> following
 */
const FollowSchema = new Schema(
  {
    follower: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    following: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Ensure a user cannot follow the same user more than once
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
