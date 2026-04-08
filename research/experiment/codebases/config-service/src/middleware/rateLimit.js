/**
 * Rate limiting middleware.
 */
const config = require('../config');

const requests = new Map();

exports.rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - config.RATE_LIMIT_WINDOW;

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests.get(ip).filter(t => t > windowStart);
  timestamps.push(now);
  requests.set(ip, timestamps);

  if (timestamps.length > config.RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // ISSUE: Map grows unbounded — no cleanup of old IPs
  next();
};
