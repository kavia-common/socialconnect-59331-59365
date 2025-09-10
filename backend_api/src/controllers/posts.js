'use strict';

const postService = require('../services/post');
const { User } = require('../models');
const notificationService = require('../services/notification');

/**
 * PostsController manages post CRUD and interactions.
 */
class PostsController {
  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Create a post. Body: { caption?, hashtags?, media: { url, type, publicId?, width?, height?, duration? } } */
    try {
      const post = await postService.createPost(req.user.sub, req.body);
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Delete a post by :id (owner only). */
    try {
      const out = await postService.deletePost(req.user.sub, req.params.id);
      res.json(out);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res, next) {
    /** Get a single post by :id */
    try {
      const post = await postService.getPostById(req.params.id);
      res.json(post);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async listByUser(req, res, next) {
    /** List posts for :username */
    try {
      const posts = await postService.listUserPosts(req.params.username, req.query.limit || 20);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async feed(req, res, next) {
    /** Feed for current user */
    try {
      const posts = await postService.feedForUser(req.user.sub, req.query.limit || 20);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async explore(req, res, next) {
    /** Explore public posts */
    try {
      const posts = await postService.explorePublic(req.query.limit || 20);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async search(req, res, next) {
    /** Search posts by ?q= (caption text or #hashtag) */
    try {
      const posts = await postService.searchPosts(req.query.q, req.query.limit || 20);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async comment(req, res, next) {
    /** Add comment: body { text, parentComment? } -> returns comment */
    try {
      const { text, parentComment } = req.body || {};
      const comment = await postService.addComment(req.user.sub, req.params.id, text, parentComment || null);

      // notify post author
      const post = await postService.getPostById(req.params.id);
      if (post && String(post.author._id) !== String(req.user.sub)) {
        await notificationService.notify({
          user: post.author._id,
          actor: req.user.sub,
          type: 'comment',
          post: post._id,
          comment: comment._id,
          metadata: { text },
        });
      }

      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async like(req, res, next) {
    /** Like a post by :id; emits 'like' notification to post owner (not self). */
    try {
      const result = await postService.likePost(req.user.sub, req.params.id);

      // fetch post to get author for notification
      const post = await postService.getPostById(req.params.id);
      if (post && String(post.author._id) !== String(req.user.sub)) {
        // Only notify when we actually created a like (avoid duplicate notification on alreadyLiked)
        if (!result.alreadyLiked) {
          await notificationService.notify({
            user: post.author._id,
            actor: req.user.sub,
            type: 'like',
            post: post._id,
            comment: null,
            metadata: {},
          });
        }
      }

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async unlike(req, res, next) {
    /** Unlike a post by :id; no notification on unlike. */
    try {
      const result = await postService.unlikePost(req.user.sub, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostsController();
