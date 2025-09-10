'use strict';

const { Post, Comment, User, Follow } = require('../models');

// PUBLIC_INTERFACE
async function createPost(authorId, { caption, hashtags, media }) {
  /** Create a post; media should include { url, type, publicId, width, height, duration }. */
  if (!media || !media.url || !media.type) {
    const err = new Error('Media is required');
    err.status = 400;
    throw err;
  }
  const cleanTags = Array.isArray(hashtags)
    ? hashtags.map((h) => String(h).replace(/^#/, '').toLowerCase()).filter(Boolean)
    : [];
  const post = await Post.create({
    author: authorId,
    caption: caption || '',
    hashtags: cleanTags,
    media,
    isPublic: true,
  });
  return await post.populate('author', '-passwordHash');
}

// PUBLIC_INTERFACE
async function deletePost(authorId, postId) {
  /** Delete a post owned by the user. */
  const post = await Post.findOne({ _id: postId, author: authorId });
  if (!post) {
    const err = new Error('Post not found or not owner');
    err.status = 404;
    throw err;
  }
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  return { ok: true };
}

// PUBLIC_INTERFACE
async function getPostById(postId) {
  /** Get single post populated. */
  const post = await Post.findById(postId).populate('author', '-passwordHash');
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  return post;
}

// PUBLIC_INTERFACE
async function listUserPosts(username, limit = 20) {
  /** List posts for a username. */
  const user = await User.findOne({ username });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('author', '-passwordHash');
}

// PUBLIC_INTERFACE
async function feedForUser(userId, limit = 20) {
  /** Feed composed of followed users' posts. */
  const following = await Follow.find({ follower: userId }).select('following');
  const followingIds = following.map((f) => f.following);
  if (!followingIds.length) return [];
  return Post.find({ author: { $in: followingIds } })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('author', '-passwordHash');
}

// PUBLIC_INTERFACE
async function explorePublic(limit = 20) {
  /** Explore: latest public posts. */
  return Post.find({ isPublic: true }).sort({ createdAt: -1 }).limit(Number(limit)).populate('author', '-passwordHash');
}

// PUBLIC_INTERFACE
async function searchPosts(query, limit = 20) {
  /** Search posts by text (caption) or hashtag. */
  if (!query) return [];
  const hashtag = query.startsWith('#') ? query.slice(1).toLowerCase() : null;
  const filter = hashtag
    ? { hashtags: hashtag }
    : { $text: { $search: query } };

  return Post.find(filter, hashtag ? {} : { score: { $meta: 'textScore' } })
    .sort(hashtag ? { createdAt: -1 } : { score: { $meta: 'textScore' } })
    .limit(Number(limit))
    .populate('author', '-passwordHash');
}

// PUBLIC_INTERFACE
async function addComment(userId, postId, text, parentComment = null) {
  /** Add a comment to a post. */
  const post = await Post.findById(postId);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  const comment = await Comment.create({
    post: post._id,
    author: userId,
    text,
    parentComment: parentComment || null,
  });
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  return comment.populate('author', '-passwordHash');
}

module.exports = {
  createPost,
  deletePost,
  getPostById,
  listUserPosts,
  feedForUser,
  explorePublic,
  searchPosts,
  addComment,
};
