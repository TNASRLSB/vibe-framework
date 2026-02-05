"""
TEST FILE: Python Vulnerabilities

This file contains INTENTIONALLY VULNERABLE code for testing heimdall.
DO NOT use this code in production!

Expected detections:
- INJ-003: Command injection (os.system, subprocess with shell=True)
- INJ-004: shell=True in subprocess
- VC-003: Unsafe pickle usage
- CF-001: Weak hash (MD5/SHA1)
- Various injection patterns
"""

import os
import subprocess
import pickle
import hashlib
import sqlite3

# ============================================
# COMMAND INJECTION
# ============================================

# INJ-003: os.system with user input
def process_file_unsafe(filename):
    """Vulnerable to command injection"""
    os.system(f"cat {filename}")

# INJ-003: os.system with string formatting
def get_file_stats(path):
    """Vulnerable to command injection"""
    os.system("ls -la %s" % path)

# INJ-004: subprocess with shell=True
def run_command_unsafe(user_command):
    """Vulnerable to command injection"""
    result = subprocess.call(user_command, shell=True)
    return result

# INJ-004: subprocess.run with shell=True
def execute_script(script_name):
    """Vulnerable to command injection"""
    subprocess.run(f"python {script_name}", shell=True)

# INJ-004: subprocess.Popen with shell=True
def start_process(cmd):
    """Vulnerable to command injection"""
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
    return proc.communicate()

# SECURE version (should NOT be flagged)
def process_file_safe(filename):
    """Safe - uses list arguments"""
    subprocess.run(['cat', filename], check=True)


# ============================================
# SQL INJECTION (Python)
# ============================================

def get_user_unsafe(user_id):
    """Vulnerable to SQL injection"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchone()

def search_users_unsafe(name):
    """Vulnerable to SQL injection"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE name LIKE '%" + name + "%'")
    return cursor.fetchall()

# SECURE version (should NOT be flagged)
def get_user_safe(user_id):
    """Safe - uses parameterized query"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return cursor.fetchone()


# ============================================
# INSECURE DESERIALIZATION
# ============================================

# VC-003: Pickle with untrusted data
def load_user_session(session_data):
    """Vulnerable to arbitrary code execution"""
    return pickle.loads(session_data)

# VC-003: Pickle load from file
def restore_state(filepath):
    """Vulnerable if file is from untrusted source"""
    with open(filepath, 'rb') as f:
        return pickle.load(f)

# VC-003: Pickle dump (less dangerous but still flagged)
def save_session(data, filepath):
    """Using pickle for serialization"""
    with open(filepath, 'wb') as f:
        pickle.dump(data, f)


# ============================================
# WEAK CRYPTOGRAPHY
# ============================================

# CF-001: MD5 for password hashing
def hash_password_md5(password):
    """Vulnerable - MD5 is broken"""
    return hashlib.md5(password.encode()).hexdigest()

# CF-001: SHA1 for security
def generate_token_sha1(data):
    """Vulnerable - SHA1 is weak"""
    return hashlib.sha1(data.encode()).hexdigest()

# SECURE version (should NOT be flagged)
def hash_password_safe(password):
    """Safe - uses SHA256"""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


# ============================================
# HARDCODED CREDENTIALS
# ============================================

# SEC-001: Hardcoded API key
API_KEY = "sk_live_FAKE_KEY_FOR_TESTING_000000000000"

# SEC-002: Hardcoded secret
SECRET_KEY = "my-super-secret-application-key"

# SEC-004: Hardcoded password
DATABASE_PASSWORD = "admin123456"

# SEC-005: Connection string with credentials
DATABASE_URL = "postgresql://admin:secretpassword@localhost:5432/mydb"
MONGO_URI = "mongodb://user:password123@localhost:27017/database"


# ============================================
# CODE INJECTION
# ============================================

# INJ-008: eval with user input
def calculate(expression):
    """Vulnerable to code injection"""
    return eval(expression)

# INJ-008: exec with user input
def run_user_code(code):
    """Vulnerable to code injection"""
    exec(code)


# ============================================
# DEBUG/LOGGING ISSUES
# ============================================

# LF-001: Sensitive data in logs
def log_login_attempt(username, password):
    """Vulnerable - logs password"""
    print(f"Login attempt: {username} with password {password}")

# SM-001: Debug mode enabled
DEBUG = True
debug = True

if __name__ == "__main__":
    # Test the vulnerable functions (don't actually run these!)
    pass
