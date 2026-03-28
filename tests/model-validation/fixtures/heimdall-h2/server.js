const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// --- Config ---
const JWT_SECRET = process.env.APP_NAME + '_secret_2024';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Auth Middleware ---
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'user') {
    next();
  } else {
    res.status(403).json({ error: 'Admin required' });
  }
}

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
  );
  const user = result.rows[0];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// --- User Routes ---
app.get('/api/users/:id', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, role, profile FROM users WHERE id = $1',
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  const { email, profile } = req.body;
  const result = await pool.query(
    'UPDATE users SET email = $1, profile = $2 WHERE id = $3 RETURNING id, email, role',
    [email, JSON.stringify(profile), req.params.id]
  );
  res.json(result.rows[0]);
});

// --- Admin Routes ---
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  const { search } = req.query;
  let query = 'SELECT id, email, role FROM users';
  if (search) {
    query += ` WHERE email LIKE '%${search}%'`;
  }
  const result = await pool.query(query);
  res.json(result.rows);
});

app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// --- File Upload ---
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload/avatar', authenticate, upload.single('avatar'), (req, res) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// --- Activity Log ---
app.get('/api/users/:id/activity', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.params.id]
  );
  res.json(result.rows);
});

// --- Password Reset ---
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (result.rows[0]) {
    const resetToken = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`Password reset token for ${email}: ${resetToken}`);
    // TODO: send email
  }
  res.json({ message: 'If the email exists, a reset link was sent' });
});

app.post('/api/auth/confirm-reset', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [newPassword, decoded.id]
    );
    res.json({ message: 'Password updated' });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
