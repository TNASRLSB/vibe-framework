#!/usr/bin/env python3
"""
Heimdall - PreToolUse Hook

Validates code BEFORE it is written to disk.
Blocks operations that would introduce critical security vulnerabilities.

Hook Configuration (.claude/settings.json):
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/skills/heimdall/hooks/pre-tool-validator.py\"",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}

Exit Codes:
  0 - Validation passed, allow operation
  1 - Warning (non-blocking), shows message but allows operation
  2 - BLOCK operation, critical security issue detected
"""

import json
import sys
import re
import os
import hashlib
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timezone


# Critical patterns that BLOCK the operation
CRITICAL_PATTERNS: List[Tuple[str, str, str]] = [
    # Hardcoded credentials
    (r'(?i)(api[_-]?key|apikey|secret[_-]?key|password)\s*[:=]\s*[\'"][a-zA-Z0-9_\-]{20,}[\'"]',
     'SEC-CRIT-001', 'Hardcoded credential detected'),

    # Stripe live keys
    (r'sk_live_[0-9a-zA-Z]{24,}',
     'SEC-CRIT-002', 'Stripe LIVE secret key - can process real payments!'),

    # AWS keys
    (r'AKIA[0-9A-Z]{16}',
     'SEC-CRIT-003', 'AWS Access Key ID detected'),

    # Private keys
    (r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
     'SEC-CRIT-004', 'Private key in source code'),

    # SQL injection with string concatenation
    (r'(?i)(execute|query)\s*\(\s*[f\'"`].*\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)',
     'INJ-CRIT-001', 'SQL injection via string interpolation'),

    # Command injection with shell=True
    (r'(?i)subprocess\.(call|run|Popen).*shell\s*=\s*True',
     'INJ-CRIT-002', 'Command injection risk with shell=True'),

    # Supabase service role in client
    (r'(?i)(NEXT_PUBLIC|VITE|REACT_APP).*SUPABASE.*SERVICE.*ROLE',
     'BAAS-CRIT-001', 'Supabase service_role key exposed to client'),

    # Firebase service account in client
    (r'(?i)(NEXT_PUBLIC|VITE|REACT_APP).*FIREBASE.*PRIVATE.*KEY',
     'BAAS-CRIT-002', 'Firebase private key exposed to client'),

    # eval with user input
    (r'(?i)eval\s*\(.*(?:req\.|params\.|query\.|body\.|user)',
     'INJ-CRIT-003', 'Code injection via eval() with user input'),
]

# High severity patterns that BLOCK
HIGH_PATTERNS: List[Tuple[str, str, str]] = [
    # XSS via innerHTML
    (r'(?i)innerHTML\s*=\s*(?!.*sanitize|.*escape|.*DOMPurify)',
     'XSS-HIGH-001', 'XSS vulnerability via innerHTML assignment'),

    # React dangerouslySetInnerHTML
    (r'(?i)dangerouslySetInnerHTML\s*=\s*\{\s*\{.*(?:req|props|state|user)',
     'XSS-HIGH-002', 'XSS via dangerouslySetInnerHTML with user data'),

    # Weak cryptography
    (r'(?i)createHash\s*\(\s*[\'"](?:md5|sha1)[\'"]\s*\)',
     'CRYPTO-HIGH-001', 'Weak hash algorithm (MD5/SHA1) for security'),

    # Logic inversion (AI-specific)
    (r'(?i)(active|enabled|isActive)\s*===?\s*false\s*&&.*(?:admin|role|access)',
     'AI-HIGH-001', 'Potential logic inversion - inactive user with elevated access'),

    # Open Firebase/Firestore rules
    (r'(?i)allow\s+(?:read|write)\s*:\s*if\s+true',
     'BAAS-HIGH-001', 'Firebase rules allow unrestricted access'),

    # JWT without verification
    (r'(?i)jwt\.decode\s*\((?!.*verify)',
     'AUTH-HIGH-001', 'JWT decoded without signature verification'),

    # Password stored without hashing
    (r'(?i)(?:user|account)\.password\s*=\s*(?:req|body|input)\.password(?!.*hash|.*bcrypt)',
     'AUTH-HIGH-002', 'Password stored without hashing'),
]

# Medium severity patterns that WARN but don't block
MEDIUM_PATTERNS: List[Tuple[str, str, str]] = [
    # Generic console.log with sensitive data
    (r'(?i)console\.log\s*\(.*(?:password|token|secret|key)',
     'LOG-MED-001', 'Potentially sensitive data in console.log'),

    # Debug mode enabled
    (r'(?i)debug\s*[:=]\s*true',
     'CFG-MED-001', 'Debug mode enabled - ensure disabled in production'),

    # Missing input validation
    (r'(?i)req\.(?:body|query|params)\.[a-zA-Z]+(?!.*valid|.*saniti|.*check)',
     'VAL-MED-001', 'User input used without apparent validation'),
]


class OriginalContentCache:
    """Caches original file content for diff analysis in post-tool hook"""

    CACHE_DIR = Path(os.environ.get('CLAUDE_PROJECT_DIR', Path.cwd())) / '.heimdall' / 'cache'

    @classmethod
    def save_original(cls, file_path: str) -> bool:
        """
        Save the original content of a file before modification.
        Returns True if content was saved (file exists).
        """
        try:
            source = Path(file_path)
            if not source.exists():
                return False

            # Create cache directory
            cls.CACHE_DIR.mkdir(parents=True, exist_ok=True)

            # Create a hash-based filename to avoid path issues
            path_hash = hashlib.md5(file_path.encode()).hexdigest()[:12]
            cache_file = cls.CACHE_DIR / f"{path_hash}.original"

            # Read and save original content
            with open(source, 'r', encoding='utf-8', errors='ignore') as f:
                original_content = f.read()

            cache_data = {
                'file_path': file_path,
                'content': original_content,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'size': len(original_content)
            }

            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f)

            return True

        except Exception:
            return False

    @classmethod
    def get_original(cls, file_path: str) -> Optional[str]:
        """
        Retrieve the cached original content for a file.
        Returns None if not cached.
        """
        try:
            path_hash = hashlib.md5(file_path.encode()).hexdigest()[:12]
            cache_file = cls.CACHE_DIR / f"{path_hash}.original"

            if not cache_file.exists():
                return None

            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)

            # Verify it's for the right file
            if cache_data.get('file_path') != file_path:
                return None

            return cache_data.get('content')

        except Exception:
            return None

    @classmethod
    def cleanup(cls, file_path: str) -> None:
        """Remove cached content for a file"""
        try:
            path_hash = hashlib.md5(file_path.encode()).hexdigest()[:12]
            cache_file = cls.CACHE_DIR / f"{path_hash}.original"
            if cache_file.exists():
                cache_file.unlink()
        except Exception:
            pass


class PreToolValidator:
    """Validates code content before writing"""

    def __init__(self):
        self.compiled_critical = [(re.compile(p, re.MULTILINE), id, msg) for p, id, msg in CRITICAL_PATTERNS]
        self.compiled_high = [(re.compile(p, re.MULTILINE), id, msg) for p, id, msg in HIGH_PATTERNS]
        self.compiled_medium = [(re.compile(p, re.MULTILINE), id, msg) for p, id, msg in MEDIUM_PATTERNS]

    def validate(self, content: str, file_path: str) -> Tuple[int, str]:
        """
        Validate content and return (exit_code, message)

        Exit codes:
          0 - Pass
          1 - Warning (non-blocking)
          2 - Block
        """
        findings_critical = []
        findings_high = []
        findings_medium = []

        lines = content.split('\n')

        # Check critical patterns
        for pattern, pattern_id, message in self.compiled_critical:
            for match in pattern.finditer(content):
                if self._is_in_comment(content, match.start(), lines):
                    continue
                line_num = content[:match.start()].count('\n') + 1
                findings_critical.append((pattern_id, message, line_num))

        # Check high patterns
        for pattern, pattern_id, message in self.compiled_high:
            for match in pattern.finditer(content):
                if self._is_in_comment(content, match.start(), lines):
                    continue
                line_num = content[:match.start()].count('\n') + 1
                findings_high.append((pattern_id, message, line_num))

        # Check medium patterns (for warnings)
        for pattern, pattern_id, message in self.compiled_medium:
            for match in pattern.finditer(content):
                if self._is_in_comment(content, match.start(), lines):
                    continue
                line_num = content[:match.start()].count('\n') + 1
                findings_medium.append((pattern_id, message, line_num))

        # Determine exit code and message
        if findings_critical:
            return self._format_block_message(findings_critical, file_path, "CRITICAL")

        if findings_high:
            return self._format_block_message(findings_high, file_path, "HIGH")

        if findings_medium:
            return self._format_warning_message(findings_medium, file_path)

        return (0, "")

    def _is_in_comment(self, content: str, position: int, lines: List[str]) -> bool:
        """Check if position is inside a comment"""
        line_num = content[:position].count('\n')
        if line_num < len(lines):
            line = lines[line_num]
            line_pos = position - content.rfind('\n', 0, position) - 1

            # Check for single-line comments before the match
            for comment_marker in ['//', '#', '--']:
                idx = line.find(comment_marker)
                if idx >= 0 and idx < line_pos:
                    return True

        return False

    def _format_block_message(self, findings: List[Tuple[str, str, int]],
                             file_path: str, severity: str) -> Tuple[int, str]:
        """Format blocking error message"""
        lines = [
            "",
            "=" * 60,
            f"🔴 HEIMDALL - OPERATION BLOCKED ({severity})",
            "=" * 60,
            "",
            f"File: {file_path}",
            "",
            "Issues detected:",
        ]

        for pattern_id, message, line_num in findings:
            lines.append(f"")
            lines.append(f"  [{pattern_id}] Line {line_num}")
            lines.append(f"  {message}")

        lines.extend([
            "",
            "-" * 60,
            "This operation has been BLOCKED to prevent security vulnerabilities.",
            "Please fix the issues above before proceeding.",
            "",
            "If you believe this is a false positive, you can:",
            "  1. Add a comment: // heimdall-ignore: PATTERN_ID",
            "  2. Review and confirm the code is safe",
            "-" * 60,
            ""
        ])

        return (2, "\n".join(lines))

    def _format_warning_message(self, findings: List[Tuple[str, str, int]],
                               file_path: str) -> Tuple[int, str]:
        """Format non-blocking warning message"""
        lines = [
            "",
            "=" * 60,
            "🟡 HEIMDALL - WARNING",
            "=" * 60,
            "",
            f"File: {file_path}",
            "",
            "Potential issues (operation allowed):",
        ]

        for pattern_id, message, line_num in findings:
            lines.append(f"  [{pattern_id}] Line {line_num}: {message}")

        lines.extend([
            "",
            "These issues do not block the operation but should be reviewed.",
            "-" * 60,
            ""
        ])

        return (1, "\n".join(lines))


def main():
    """Main entry point for hook"""
    try:
        # Read input from stdin (Claude Code passes JSON)
        input_data = json.load(sys.stdin)

        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})

        # Only validate Write and Edit tools
        if tool_name not in ['Write', 'Edit']:
            sys.exit(0)

        # Get content to validate
        content = tool_input.get('content') or tool_input.get('new_string', '')
        file_path = tool_input.get('file_path', 'unknown')

        # Save original file content for diff analysis (before modification)
        # This is used by post-tool-scanner.py to detect security pattern removal
        if file_path and file_path != 'unknown':
            OriginalContentCache.save_original(file_path)

        if not content:
            sys.exit(0)

        # Run validation
        validator = PreToolValidator()
        exit_code, message = validator.validate(content, file_path)

        if message:
            print(message, file=sys.stderr)

        sys.exit(exit_code)

    except json.JSONDecodeError:
        # If no JSON input, might be direct invocation for testing
        print("Error: Expected JSON input from Claude Code hook", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        # Don't block on hook errors
        print(f"Heimdall hook error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
