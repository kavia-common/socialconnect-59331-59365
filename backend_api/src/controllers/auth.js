'use strict';

const authService = require('../services/auth');

/**
 * AuthController manages user registration, login, logout, and current session profile.
 */
class AuthController {
  // PUBLIC_INTERFACE
  async signup(req, res, next) {
    /** Register a new user. Body: { username, email, password } -> user */
    try {
      const user = await authService.signup(req.body);
      const token = authService.signToken(user);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Login with body: { emailOrUsername, password } -> { token, user } */
    try {
      const data = await authService.login(req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async me(req, res, next) {
    /** Get current user profile using req.user.sub */
    try {
      const me = await authService.getMe(req.user.sub);
      res.json(me);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async logout(req, res, next) {
    /** Stateless JWT logout (client drops token) */
    try {
      const out = await authService.logout();
      res.json(out);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
