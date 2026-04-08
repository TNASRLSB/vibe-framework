/**
 * Health check routes.
 */
const config = require('../config');

exports.check = (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
};

exports.ready = (req, res) => {
  const errors = config.validate();
  if (errors.length > 0) {
    return res.status(503).json({ status: 'not ready', errors });
  }
  res.json({ status: 'ready' });
};
