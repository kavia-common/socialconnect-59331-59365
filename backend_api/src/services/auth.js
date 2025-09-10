'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const config = require('../config');

const TOKEN_EXPIRY = '7d';

// PUBLIC_INTERFACE
async function signup({ username, email, password }) {
  /** Create a new user with hashed password. */
  if (!username || !email || !password) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const err = new Error('User with email/username already exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });
  return sanitizeUser(user);
}

// PUBLIC_INTERFACE
async function login({ emailOrUsername, password }) {
  /** Authenticate using email or username and issue JWT. */
  if (!emailOrUsername || !password) {
    const err = new Error('Missing credentials');
    err.status = 400;
    throw err;
  }
  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
  });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

// PUBLIC_INTERFACE
function signToken(user) {
  /** Create a JWT from user record. */
  if (!config.jwtSecret) {
    const err = new Error('Server misconfiguration: JWT secret missing');
    err.status = 500;
    throw err;
  }
  const payload = { sub: user._id.toString(), username: user.username, email: user.email };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

function sanitizeUser(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  delete u.passwordHash;
  return u;
}

// PUBLIC_INTERFACE
async function getMe(userId) {
  /** Return current user profile without password. */
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return sanitizeUser(user);
}

// PUBLIC_INTERFACE
async function logout() {
  /** Stateless JWT logout - client discards token. Provided for API symmetry. */
  return { ok: true };
}

module.exports = {
  signup,
  login,
  logout,
  getMe,
  signToken,
};
