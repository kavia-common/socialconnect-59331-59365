const auth = require('./auth');
const { validate } = require('./validation');

// Centralized middleware exports for the app
module.exports = {
  auth,
  validate,
};
