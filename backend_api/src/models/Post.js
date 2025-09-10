'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    publicId: { type: String },
    width: Number,
    height: Number,
    duration: Number,
  },
  { _id: false }
);

const PostSchema = new Schema(
  {
    author: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    caption: { type: String, default: '' },
    hashtags: [{ type: String, index: true }],
    media: { type: MediaSchema, required: true },
    isPublic: { type: Boolean, default: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ caption: 'text', hashtags: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
