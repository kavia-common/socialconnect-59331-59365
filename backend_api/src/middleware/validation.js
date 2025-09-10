'use strict';

const { validationResult } = require('express-validator');

/**
 * PUBLIC_INTERFACE
 * Wrapper to run express-validator chains and handle errors consistently.
 * Use validate([...]) before your controller to validate request input.
 */
function validate(validations) {
  /** Apply validations and return 400 with details on failure. */
  return async (req, res, next) => {
    try {
      // Run all validations
      for (const validation of validations) {
        // Run each validator; stop at first failure for performance
        // but we still collect all errors at the end.
        await validation.run(req);
      }

      const result = validationResult(req);
      if (result.isEmpty()) {
        return next();
      }

      const details = result.array({ onlyFirstError: true }).map((e) => ({
        field: e.param,
        location: e.location,
        message: e.msg,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details,
      });
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  validate,
};
