'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/**
 * Like model: records a like by a user on a post.
 * Enforces uniqueness so a user can like a post only once.
 */
const LikeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Types.ObjectId, ref: 'Post', required: true, index: true },
  },
  { timestamps: true }
);

// Enforce unique like (user, post) pair
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

// Optimize read patterns
LikeSchema.index({ post: 1, createdAt: -1 });
LikeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Like', LikeSchema);
