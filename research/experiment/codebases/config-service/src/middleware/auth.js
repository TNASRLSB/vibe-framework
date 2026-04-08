/**
 * Authentication middleware.
 */
const config = require('../config');

exports.authMiddleware = (req, res, next) => {
  const apiKey = req.headers[config.API_KEY_HEADER.toLowerCase()];
  const bearerToken = req.headers.authorization;

  if (apiKey) {
    // ISSUE: API key is not validated against a store, any value accepted
    req.user = { type: 'api-key' };
    return next();
  }

  if (bearerToken && bearerToken.startsWith('Bearer ')) {
    // ISSUE: JWT is not actually verified
    req.user = { type: 'bearer' };
    return next();
  }

  res.status(401).json({ error: 'Authentication required' });
};
