/**
 * TEST FILE: Injection Vulnerabilities
 *
 * This file contains INTENTIONALLY VULNERABLE code for testing heimdall.
 * DO NOT use this code in production!
 *
 * Expected detections:
 * - INJ-001: SQL injection via string concatenation
 * - INJ-002: SQL injection via template literal
 * - INJ-003: Command injection via exec
 * - INJ-008: eval() with user input
 * - XSS-001: innerHTML assignment
 * - XSS-003: dangerouslySetInnerHTML
 */

// ============================================
// SQL INJECTION EXAMPLES
// ============================================

// INJ-001: SQL injection - string concatenation
async function getUserByIdUnsafe(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return await db.execute(query);
}

// INJ-002: SQL injection - template literal
async function searchUsers(searchTerm) {
  const result = await db.query(`SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`);
  return result;
}

// SECURE version for comparison (should NOT be flagged)
async function getUserByIdSafe(userId) {
  return await db.query('SELECT * FROM users WHERE id = $1', [userId]);
}

// ============================================
// COMMAND INJECTION EXAMPLES
// ============================================

const { exec, execSync } = require('child_process');

// INJ-003: Command injection via exec
function processFile(filename) {
  exec(`cat ${filename} | wc -l`, (error, stdout) => {
    console.log(stdout);
  });
}

// INJ-003: Command injection via execSync
function getFileInfo(userPath) {
  const result = execSync(`ls -la ${userPath}`);
  return result.toString();
}

// SECURE version (should NOT be flagged)
const { execFile } = require('child_process');
function processFileSafe(filename) {
  execFile('cat', [filename], (error, stdout) => {
    console.log(stdout);
  });
}

// ============================================
// CODE INJECTION EXAMPLES
// ============================================

// INJ-008: eval with user input
function calculateExpression(userExpression) {
  return eval(userExpression);
}

// INJ-008: eval with request body
function processFormula(req, res) {
  const result = eval(req.body.formula);
  res.json({ result });
}

// ============================================
// XSS EXAMPLES
// ============================================

// XSS-001: innerHTML assignment
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// XSS-001: outerHTML
function updateProfile(bio) {
  document.querySelector('.bio').outerHTML = `<div class="bio">${bio}</div>`;
}

// XSS-002: document.write
function showWelcome(username) {
  document.write(`<h1>Welcome, ${username}!</h1>`);
}

// XSS-003: React dangerouslySetInnerHTML (in JSX context)
function UserBio({ user }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: user.bio }} />
  );
}

// XSS-004: jQuery html()
function updateContent(content) {
  $('#content').html(content);
  jQuery('.message').html(userMessage);
}

// SECURE version (should NOT be flagged)
function displayUserCommentSafe(comment) {
  document.getElementById('comments').textContent = comment;
}

// ============================================
// NOSQL INJECTION
// ============================================

// INJ-005: MongoDB $where injection
async function findUserByEmail(email) {
  return await User.findOne({ $where: `this.email === '${email}'` });
}

// INJ-005: MongoDB operator injection
async function authenticateUser(username, password) {
  return await User.find({
    username: username,
    password: { $gt: '' }  // Always true if password exists
  });
}

module.exports = {
  getUserByIdUnsafe,
  searchUsers,
  processFile,
  calculateExpression,
  displayUserComment
};
