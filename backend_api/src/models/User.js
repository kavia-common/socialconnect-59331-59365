'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * User schema:
 * - Enforces unique username and email with case-insensitive collation.
 * - Provides text index on username and email for search.
 * - Adds single-field indexes used by frequent lookups.
 */
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false, index: true },
    lastLoginAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 }, // ensure case-insensitive unique checks
  }
);

// Unique constraints (explicit for clarity; unique on fields also applied above)
UserSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
UserSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Text index for user search
UserSchema.index({ username: 'text', email: 'text' });

module.exports = mongoose.model('User', UserSchema);
