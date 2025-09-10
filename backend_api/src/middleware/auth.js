'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Extract Bearer token from Authorization header.
 */
function getTokenFromHeader(req) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme && scheme.toLowerCase() === 'bearer' && token) return token;
  return null;
}

/**
 * PUBLIC_INTERFACE
 * JWT authentication middleware (non-blocking scaffold).
 * - Verifies JWT if present and attaches decoded payload to req.user.
 * - If required=true, responds 401 when no/invalid token.
 */
function auth(required = true) {
  /** Express middleware to verify JWT and attach req.user */
  return (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
      if (required) return res.status(401).json({ message: 'Unauthorized' });
      req.user = null;
      return next();
    }
    try {
      if (!config.jwtSecret) {
        console.warn('JWT_SECRET not configured; rejecting authentication.');
        if (required) return res.status(500).json({ message: 'Server misconfiguration' });
        req.user = null;
        return next();
      }
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload;
      return next();
    } catch (err) {
      if (required) return res.status(401).json({ message: 'Invalid token' });
      req.user = null;
      return next();
    }
  };
}

module.exports = auth;
