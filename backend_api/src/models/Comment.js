'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CommentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true },
    parentComment: { type: Types.ObjectId, ref: 'Comment', default: null, index: true },
  },
  { timestamps: true }
);

// Compound indexes to support common reads
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
