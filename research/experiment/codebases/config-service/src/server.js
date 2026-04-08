/**
 * Express server setup with 14 routes.
 */
const express = require('express');
const config = require('./config');
const { authMiddleware } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimit');
const { logger } = require('./middleware/logger');

const configRoutes = require('./routes/config');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

const app = express();

app.use(express.json());
app.use(logger);
app.use(rateLimiter);

// RT-01: Health check
app.get('/health', healthRoutes.check);

// RT-02: Readiness probe
app.get('/ready', healthRoutes.ready);

// RT-03: List all config keys (public names only)
app.get('/api/config', configRoutes.listKeys);

// RT-04: Get single config value
app.get('/api/config/:key', authMiddleware, configRoutes.getKey);

// RT-05: Update config value
app.put('/api/config/:key', authMiddleware, configRoutes.updateKey);

// RT-06: Validate current config
app.post('/api/config/validate', authMiddleware, configRoutes.validate);

// RT-07: Export config as JSON
app.get('/api/config/export/json', authMiddleware, configRoutes.exportJson);

// RT-08: List users
app.get('/api/users', authMiddleware, userRoutes.list);

// RT-09: Create user
app.post('/api/users', authMiddleware, userRoutes.create);

// RT-10: Get user by ID
app.get('/api/users/:id', authMiddleware, userRoutes.getById);

// RT-11: Update user
app.put('/api/users/:id', authMiddleware, userRoutes.update);

// RT-12: Delete user
app.delete('/api/users/:id', authMiddleware, userRoutes.remove);

// RT-13: User config overrides
app.get('/api/users/:id/config', authMiddleware, userRoutes.getConfig);

// RT-14: Set user config override
app.put('/api/users/:id/config', authMiddleware, userRoutes.setConfig);

const errors = config.validate();
if (errors.length > 0) {
  console.error('Configuration errors:', errors);
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
}

app.listen(config.PORT, config.HOST, () => {
  console.log(`Server running on ${config.HOST}:${config.PORT} [${config.NODE_ENV}]`);
});

module.exports = app;
