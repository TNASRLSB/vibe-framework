/**
 * TEST FILE: Authentication & Cryptography Vulnerabilities
 *
 * This file contains INTENTIONALLY VULNERABLE code for testing heimdall.
 * DO NOT use this code in production!
 *
 * Expected detections:
 * - CF-001: Weak hash (MD5/SHA1)
 * - CF-002: Deprecated cipher
 * - CF-003: Hardcoded encryption key
 * - CF-005: Password in plain text
 * - AF-001: Weak password requirements
 * - AF-002: Missing password hashing
 * - AF-006: JWT in localStorage
 * - BAC-003: Logic inversion (AI-specific)
 * - BAC-006: JWT without verification
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ============================================
// WEAK CRYPTOGRAPHY
// ============================================

// CF-001: MD5 for password hashing
function hashPasswordMD5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// CF-001: SHA1 for security purposes
function generateTokenSHA1(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}

// CF-002: Deprecated cipher (DES)
function encryptDataDES(data, key) {
  const cipher = crypto.createCipher('des', key);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// CF-002: RC4 cipher
function encryptRC4(data, key) {
  const cipher = crypto.createCipher('rc4', key);
  return cipher.update(data, 'utf8', 'hex');
}

// CF-003: Hardcoded encryption key
const ENCRYPTION_KEY = "my-super-secret-key-12345";
function encryptSensitiveData(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return cipher.update(data);
}

// CF-003: Hardcoded secret key
const config = {
  secretKey: "hardcoded-secret-value-never-do-this",
  apiKey: "sk_live_abcdefghijklmnop123456"
};

// CF-004: Static IV
const STATIC_IV = "1234567890123456";
function encryptWithStaticIV(data, key) {
  const iv = STATIC_IV;
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return cipher.update(data);
}

// CF-005: Password stored in plain text
const adminPassword = "SuperSecret123!";
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'admin123456'
};

// ============================================
// AUTHENTICATION FAILURES
// ============================================

// AF-001: Weak password requirements
function validatePassword(password) {
  if (password.length < 4) {
    return false;
  }
  return true;
}

// AF-001: Minimum length too short
const passwordRules = {
  minLength: 6,  // Should be at least 8
  requireSpecial: false
};

// AF-002: Password stored without hashing
async function createUser(req, res) {
  const user = new User();
  user.email = req.body.email;
  user.password = req.body.password;  // No hashing!
  await user.save();
}

// AF-002: Direct password assignment
async function updatePassword(userId, newPassword) {
  const user = await User.findById(userId);
  user.password = newPassword;  // Should be hashed
  await user.save();
}

// AF-005: Credential in URL
function buildAuthUrl(token) {
  return `https://api.example.com/auth?token=${token}&password=${password}`;
}

// AF-006: JWT stored in localStorage
function saveAuthToken(token) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('jwt', token);
}

// ============================================
// ACCESS CONTROL FAILURES
// ============================================

// BAC-003: Logic inversion - AI-specific vulnerability
function checkAdminAccess(user) {
  // BUG: Grants admin access when user is INACTIVE!
  if (user.active === false && user.role === 'admin') {
    return true;  // This is backwards!
  }
  return false;
}

// BAC-003: Another logic inversion
function canAccessDashboard(user) {
  if (user.isActive === false && user.isAdmin) {
    grantDashboardAccess(user);
  }
}

// BAC-006: JWT decoded without verification
function getUserFromToken(token) {
  const payload = jwt.decode(token);  // No signature verification!
  return payload.userId;
}

// BAC-001: Role bypass with OR condition
function checkPermission(user, resource) {
  if (user.role === 'admin' || resource.isPublic || user.bypass) {
    return true;
  }
}

// ============================================
// INSECURE RANDOMNESS
// ============================================

// ID-004: Math.random for security
function generateResetToken() {
  return Math.random().toString(36).substring(2);
}

function generateSessionId() {
  return 'session_' + Math.random().toString(36);
}

// SECURE version (should NOT be flagged)
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  hashPasswordMD5,
  encryptDataDES,
  validatePassword,
  checkAdminAccess,
  generateResetToken
};
