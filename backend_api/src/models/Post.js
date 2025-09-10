'use strict';

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    publicId: { type: String, index: true },
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
    isPublic: { type: Boolean, default: true, index: true },
    likeCount: { type: Number, default: 0, index: true },
    commentCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Text search over caption, and include hashtags + createdAt for combined querying
PostSchema.index({ caption: 'text' });

// Compound index to optimize user profile/timeline queries
PostSchema.index({ author: 1, createdAt: -1 });

// Compound index for explore queries by isPublic and recency
PostSchema.index({ isPublic: 1, createdAt: -1 });

// Optional compound for hashtag queries by recency
PostSchema.index({ hashtags: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
