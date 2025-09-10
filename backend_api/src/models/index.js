'use strict';

/**
 * PUBLIC_INTERFACE
 * Export all Mongoose models from a single entry for easier imports elsewhere.
 */
module.exports = {
  User: require('./User'),
  Post: require('./Post'),
  Comment: require('./Comment'),
  Notification: require('./Notification'),
  Follow: require('./Follow'),
  Like: require('./Like'),
};
