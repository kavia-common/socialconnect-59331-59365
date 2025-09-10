'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CommentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true },
    parentComment: { type: Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
