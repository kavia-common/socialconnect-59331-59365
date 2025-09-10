'use strict';

const userService = require('../services/user');

/**
 * UsersController handles profile view/update and user search.
 */
class UsersController {
  // PUBLIC_INTERFACE
  async getProfile(req, res, next) {
    /** Get profile by username param. */
    try {
      const profile = await userService.getProfileByUsername(req.params.username, req.user?.sub);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async updateProfile(req, res, next) {
    /** Update current user's profile. Body: { bio?, avatarUrl?, username? } */
    try {
      const updated = await userService.updateProfile(req.user.sub, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async search(req, res, next) {
    /** Search users by ?q= query. */
    try {
      const results = await userService.searchUsers(req.query.q, req.query.limit || 10);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersController();
