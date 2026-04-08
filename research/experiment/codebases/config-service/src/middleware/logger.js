/**
 * Request logging middleware.
 */
const config = require('../config');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

exports.logger = (req, res, next) => {
  const level = LEVELS[config.LOG_LEVEL] || 1;
  if (level <= LEVELS.info) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
  }
  next();
};
