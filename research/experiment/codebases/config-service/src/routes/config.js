/**
 * Configuration routes.
 */
const config = require('../config');

const SAFE_KEYS = [
  'PORT', 'HOST', 'NODE_ENV', 'LOG_LEVEL', 'CORS_ORIGINS',
  'RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX', 'UPLOAD_MAX_SIZE',
  'API_KEY_HEADER', 'PAGINATION_LIMIT'
];

const SECRET_KEYS = [
  'JWT_SECRET', 'SESSION_SECRET', 'SMTP_PASS', 'DATABASE_URL', 'REDIS_URL'
];

exports.listKeys = (req, res) => {
  res.json({ keys: SAFE_KEYS });
};

exports.getKey = (req, res) => {
  const { key } = req.params;
  if (SECRET_KEYS.includes(key)) {
    return res.status(403).json({ error: 'Cannot read secret keys via API' });
  }
  if (config[key] === undefined) {
    return res.status(404).json({ error: `Key '${key}' not found` });
  }
  res.json({ key, value: config[key] });
};

exports.updateKey = (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  // ISSUE: runtime config mutation does not persist
  config[key] = value;
  res.json({ key, value, warning: 'Change is in-memory only' });
};

exports.validate = (req, res) => {
  const errors = config.validate();
  res.json({ valid: errors.length === 0, errors });
};

exports.exportJson = (req, res) => {
  // ISSUE: exports ALL keys including secrets
  const exported = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v !== 'function') {
      exported[k] = v;
    }
  }
  res.json(exported);
};
