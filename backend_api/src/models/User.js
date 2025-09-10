'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ username: 'text', email: 'text' });

module.exports = mongoose.model('User', UserSchema);
