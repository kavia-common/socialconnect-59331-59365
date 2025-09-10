'use strict';

const { User, Follow } = require('../models');

// PUBLIC_INTERFACE
async function getProfileByUsername(username, currentUserId) {
  /** Get public profile plus follow stats and relationship to current user. */
  const user = await User.findOne({ username });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const [followers, following, isFollowing] = await Promise.all([
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    currentUserId
      ? Follow.exists({ follower: currentUserId, following: user._id })
      : Promise.resolve(false),
  ]);

  const clean = user.toObject();
  delete clean.passwordHash;

  return { ...clean, stats: { followers, following }, isFollowing: !!isFollowing };
}

// PUBLIC_INTERFACE
async function updateProfile(userId, { bio, avatarUrl, username }) {
  /** Update allowed profile fields. */
  const update = {};
  if (typeof bio === 'string') update.bio = bio;
  if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl;
  if (typeof username === 'string') update.username = username;

  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const clean = user.toObject();
  delete clean.passwordHash;
  return clean;
}

// PUBLIC_INTERFACE
async function searchUsers(q, limit = 10) {
  /** Search users by username or email text index. */
  if (!q) return [];
  return User.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' }, passwordHash: 0 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Number(limit));
}

module.exports = {
  getProfileByUsername,
  updateProfile,
  searchUsers,
};
