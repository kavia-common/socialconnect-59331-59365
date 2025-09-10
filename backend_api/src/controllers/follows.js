'use strict';

const followService = require('../services/follow');
const notificationService = require('../services/notification');

/**
 * FollowsController manages follow/unfollow operations and listings.
 */
class FollowsController {
  // PUBLIC_INTERFACE
  async follow(req, res, next) {
    /** Follow a user by :username path. */
    try {
      const result = await followService.followUser(req.user.sub, req.params.username);
      // emit notification to user being followed
      await notificationService.notify({
        user: result.followingUserId,
        actor: req.user.sub,
        type: 'follow',
        metadata: {},
      });
      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async unfollow(req, res, next) {
    /** Unfollow a user by :username path. */
    try {
      const result = await followService.unfollowUser(req.user.sub, req.params.username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async followers(req, res, next) {
    /** Get followers of :username */
    try {
      const list = await followService.listFollowers(req.params.username, req.query.limit || 20);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async following(req, res, next) {
    /** Get following of :username */
    try {
      const list = await followService.listFollowing(req.params.username, req.query.limit || 20);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FollowsController();
