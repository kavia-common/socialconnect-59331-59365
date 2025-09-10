'use strict';

const { User } = require('../../src/models');
const authService = require('../../src/services/auth');

/**
 * Create and login a user quickly; returns { user, token }.
 */
async function createAndLoginUser({ username, email, password } = {}) {
  const uniq = Math.random().toString(36).slice(2, 8);
  const u = username || `user_${uniq}`;
  const e = email || `user_${uniq}@example.com`;
  const p = password || 'Password123!';
  // Use service to create hashed user to keep consistent
  const user = await User.create({
    username: u,
    email: e,
    passwordHash: require('bcryptjs').hashSync(p, 10),
  });
  const token = authService.signToken(user);
  return { user: user.toObject(), token, password: p };
}

module.exports = {
  createAndLoginUser,
};
