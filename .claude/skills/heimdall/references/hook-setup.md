# Hook Configuration

Heimdall uses Claude Code hooks to validate code during Write/Edit operations. Hooks run automatically — no manual invocation needed.

## `.claude/settings.json` Configuration

Add the following to your project's `.claude/settings.json`:

```json
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
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/skills/heimdall/hooks/post-tool-scanner.py\"",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

## How It Works

- **PreToolUse**: Saves original content and validates new code BEFORE writing
- **PostToolUse**: Performs diff analysis, import checking, and security scanning AFTER writing

Both hooks timeout after 10 seconds to avoid blocking the development workflow.

## CI/CD Integration

GitHub Actions example:

```yaml
- name: Security Guardian Scan
  run: |
    python3 .claude/skills/heimdall/scripts/scanner.py --format sarif --output security-results.sarif .

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: security-results.sarif
```

This generates a SARIF report compatible with GitHub's Security tab for continuous security monitoring.
