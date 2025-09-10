'use strict';

const { Follow, User } = require('../models');

// PUBLIC_INTERFACE
async function followUser(followerId, targetUsername) {
  /** Create follow record (idempotent). */
  const target = await User.findOne({ username: targetUsername });
  if (!target) {
    const err = new Error('Target user not found');
    err.status = 404;
    throw err;
  }
  if (target._id.toString() === followerId) {
    const err = new Error('Cannot follow yourself');
    err.status = 400;
    throw err;
  }
  await Follow.updateOne(
    { follower: followerId, following: target._id },
    { $setOnInsert: { follower: followerId, following: target._id } },
    { upsert: true }
  );
  return { ok: true, followingUserId: target._id.toString() };
}

// PUBLIC_INTERFACE
async function unfollowUser(followerId, targetUsername) {
  /** Remove follow relation if exists. */
  const target = await User.findOne({ username: targetUsername });
  if (!target) {
    const err = new Error('Target user not found');
    err.status = 404;
    throw err;
  }
  await Follow.deleteOne({ follower: followerId, following: target._id });
  return { ok: true };
}

// PUBLIC_INTERFACE
async function listFollowers(username, limit = 20) {
  /** List followers of the given username. */
  const user = await User.findOne({ username });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const relations = await Follow.find({ following: user._id })
    .limit(Number(limit))
    .populate('follower', '-passwordHash');
  return relations.map((r) => r.follower);
}

// PUBLIC_INTERFACE
async function listFollowing(username, limit = 20) {
  /** List accounts that the user is following. */
  const user = await User.findOne({ username });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const relations = await Follow.find({ follower: user._id })
    .limit(Number(limit))
    .populate('following', '-passwordHash');
  return relations.map((r) => r.following);
}

module.exports = {
  followUser,
  unfollowUser,
  listFollowers,
  listFollowing,
};
