#!/usr/bin/env python3
"""
Heimdall - Diff Analyzer Module

Detects removal of security patterns between file versions.
Critical for catching iteration degradation in AI-generated code.

Usage:
    from diff_analyzer import DiffAnalyzer, SECURITY_PATTERNS

    analyzer = DiffAnalyzer(SECURITY_PATTERNS)
    result = analyzer.analyze_diff(old_content, new_content, file_path)

    if result.removed_patterns:
        print(f"Security patterns removed: {result.removed_patterns}")
"""

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum


class DiffSeverity(Enum):
    """Severity levels for diff analysis results"""
    OK = 0
    INFO = 1
    WARNING = 2
    HIGH = 3
    CRITICAL = 4


# Security patterns to track for removal
SECURITY_PATTERNS: Dict[str, List[str]] = {
    "auth_check": [
        r"if\s*\(\s*!?\s*(auth|session|user|token|isAuth|isLoggedIn|isAuthenticated)",
        r"requireAuth|checkAuth|verifyAuth|authenticate|ensureAuth",
        r"middleware\s*\.\s*(auth|protect|guard|secure)",
        r"@(Auth|Authenticated|RequireAuth|Protected)",
        r"auth\s*\?\s*\.|session\s*\?\s*\.",
    ],
    "validation": [
        r"\b(validate|sanitize|escape|purify|clean)\s*\(",
        r"(zod|yup|joi|ajv)\s*\.",
        r"\.(parse|validate|safeParse)\s*\(",
        r"validator\s*\.\s*\w+\s*\(",
        r"@(IsEmail|IsString|IsNumber|MinLength|MaxLength|Validate)",
    ],
    "rate_limiting": [
        r"rateLimit|throttle|limiter",
        r"express-rate-limit|rate-limiter-flexible",
        r"@(RateLimit|Throttle)",
        r"slowDown|brute|antiSpam",
    ],
    "access_control": [
        r"\.(can|hasPermission|hasRole|isAdmin|isOwner)\s*\(",
        r"(rbac|acl|permission|authorize)\s*[\.\(]",
        r"@(Roles|Permissions|Authorize|Policy)",
        r"checkPermission|verifyRole|guardRoute",
    ],
    "crypto": [
        r"(bcrypt|argon2|scrypt|pbkdf2)\s*\.",
        r"crypto\.(randomBytes|randomUUID|randomInt)",
        r"(hash|encrypt|sign)\s*\(",
        r"createHash|createCipheriv|createHmac",
    ],
    "input_sanitization": [
        r"DOMPurify\.sanitize|xss\s*\(|escape\s*\(",
        r"encodeURIComponent|encodeURI|htmlEncode",
        r"textContent\s*=",
        r"createTextNode",
    ],
    "sql_protection": [
        r"\$\d+|\?\s*,|\?\s*\)|%s\s*,",  # Parameterized queries
        r"prepared|parameterized|placeholder",
        r"\.where\s*\(.*,\s*\[",  # ORM with params
        r"sql`|sql\.raw",  # Tagged template literals
    ],
    "csrf_protection": [
        r"csrf|xsrf|csrfToken|_csrf",
        r"@(CsrfProtection|ValidateCsrf)",
        r"sameSite\s*[:=]\s*['\"]strict['\"]",
    ],
    "security_headers": [
        r"helmet\s*\(",
        r"Content-Security-Policy|X-Frame-Options|X-XSS-Protection",
        r"Strict-Transport-Security|X-Content-Type-Options",
    ],
}

# Path patterns that increase severity when security is removed
SENSITIVE_PATH_PATTERNS: List[Tuple[str, float]] = [
    (r"auth|login|signin|session", 2.0),
    (r"admin|dashboard|manage", 1.5),
    (r"payment|billing|checkout|stripe", 2.0),
    (r"user|profile|account", 1.5),
    (r"api|endpoint|route|handler", 1.3),
    (r"middleware|guard|protect", 1.8),
]


@dataclass
class PatternMatch:
    """Represents a security pattern found in code"""
    category: str
    line_number: int
    line_content: str
    pattern_matched: str


@dataclass
class DiffResult:
    """Result of diff analysis between two versions"""
    removed_patterns: Dict[str, int] = field(default_factory=dict)
    added_patterns: Dict[str, int] = field(default_factory=dict)
    removed_details: List[PatternMatch] = field(default_factory=list)
    severity: DiffSeverity = DiffSeverity.OK
    message: str = ""
    file_path: str = ""

    @property
    def has_security_regression(self) -> bool:
        """Check if any security patterns were removed"""
        return len(self.removed_patterns) > 0

    @property
    def total_removed(self) -> int:
        """Total number of security patterns removed"""
        return sum(self.removed_patterns.values())

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "removed_patterns": self.removed_patterns,
            "added_patterns": self.added_patterns,
            "removed_details": [
                {
                    "category": m.category,
                    "line": m.line_number,
                    "content": m.line_content[:100],
                    "pattern": m.pattern_matched
                }
                for m in self.removed_details
            ],
            "severity": self.severity.name,
            "message": self.message,
            "file_path": self.file_path,
            "has_security_regression": self.has_security_regression,
            "total_removed": self.total_removed
        }


class DiffAnalyzer:
    """Analyzes diffs between file versions to detect security pattern changes"""

    def __init__(self, security_patterns: Optional[Dict[str, List[str]]] = None):
        """
        Initialize the analyzer with security patterns.

        Args:
            security_patterns: Dict mapping category names to regex patterns.
                             Uses SECURITY_PATTERNS if not provided.
        """
        patterns = security_patterns or SECURITY_PATTERNS
        self.patterns: Dict[str, List[re.Pattern]] = {}

        for category, pattern_list in patterns.items():
            self.patterns[category] = []
            for pattern_str in pattern_list:
                try:
                    compiled = re.compile(pattern_str, re.IGNORECASE)
                    self.patterns[category].append(compiled)
                except re.error as e:
                    print(f"Warning: Invalid regex pattern in {category}: {e}")

    def find_security_patterns(self, content: str) -> Dict[str, List[PatternMatch]]:
        """
        Find all security patterns in content with their line numbers.

        Args:
            content: The source code to analyze

        Returns:
            Dict mapping category to list of PatternMatch objects
        """
        results: Dict[str, List[PatternMatch]] = {cat: [] for cat in self.patterns}
        lines = content.split('\n')

        for category, patterns in self.patterns.items():
            for line_num, line in enumerate(lines, 1):
                # Skip comments (basic heuristic)
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('#'):
                    continue
                if stripped.startswith('/*') or stripped.startswith('*'):
                    continue

                for pattern in patterns:
                    if pattern.search(line):
                        results[category].append(PatternMatch(
                            category=category,
                            line_number=line_num,
                            line_content=line.strip(),
                            pattern_matched=pattern.pattern
                        ))
                        break  # One match per line per category is enough

        return results

    def _get_path_severity_multiplier(self, file_path: str) -> float:
        """Get severity multiplier based on file path"""
        multiplier = 1.0
        for pattern, mult in SENSITIVE_PATH_PATTERNS:
            if re.search(pattern, file_path, re.IGNORECASE):
                multiplier = max(multiplier, mult)
        return multiplier

    def _calculate_severity(
        self,
        removed: Dict[str, int],
        file_path: str
    ) -> Tuple[DiffSeverity, str]:
        """
        Calculate severity based on removed patterns and file context.

        Returns:
            Tuple of (severity, message)
        """
        if not removed:
            return DiffSeverity.OK, ""

        total_removed = sum(removed.values())
        path_multiplier = self._get_path_severity_multiplier(file_path)

        # Critical patterns that should never be removed
        critical_categories = {'auth_check', 'crypto', 'access_control'}
        critical_removed = sum(
            count for cat, count in removed.items()
            if cat in critical_categories
        )

        # Build message
        categories_str = ", ".join(
            f"{cat} ({count})" for cat, count in removed.items()
        )

        # Determine severity
        if critical_removed > 0 and path_multiplier >= 1.5:
            severity = DiffSeverity.CRITICAL
            message = f"CRITICAL: Security patterns removed from sensitive file: {categories_str}"
        elif critical_removed >= 2 or (critical_removed >= 1 and path_multiplier >= 2.0):
            severity = DiffSeverity.CRITICAL
            message = f"CRITICAL: Multiple auth/crypto patterns removed: {categories_str}"
        elif total_removed >= 3 or critical_removed >= 1:
            severity = DiffSeverity.HIGH
            message = f"HIGH: Security patterns removed: {categories_str}"
        elif total_removed >= 2:
            severity = DiffSeverity.WARNING
            message = f"WARNING: Security patterns removed: {categories_str}"
        else:
            severity = DiffSeverity.INFO
            message = f"INFO: Security pattern removed: {categories_str}"

        return severity, message

    def analyze_diff(
        self,
        old_content: str,
        new_content: str,
        file_path: str = ""
    ) -> DiffResult:
        """
        Compare old and new content to detect security pattern changes.

        Args:
            old_content: Original file content
            new_content: New file content
            file_path: Path to file (for context-aware severity)

        Returns:
            DiffResult with analysis
        """
        old_patterns = self.find_security_patterns(old_content)
        new_patterns = self.find_security_patterns(new_content)

        removed: Dict[str, int] = {}
        added: Dict[str, int] = {}
        removed_details: List[PatternMatch] = []

        for category in self.patterns:
            old_count = len(old_patterns[category])
            new_count = len(new_patterns[category])

            if new_count < old_count:
                diff = old_count - new_count
                removed[category] = diff
                # Track which specific patterns were removed
                # (patterns in old but not in new at same/similar lines)
                removed_details.extend(old_patterns[category][:diff])
            elif new_count > old_count:
                added[category] = new_count - old_count

        severity, message = self._calculate_severity(removed, file_path)

        return DiffResult(
            removed_patterns=removed,
            added_patterns=added,
            removed_details=removed_details,
            severity=severity,
            message=message,
            file_path=file_path
        )

    def format_report(self, result: DiffResult) -> str:
        """Format a human-readable report from diff result"""
        if not result.has_security_regression:
            return ""

        lines = [
            "",
            "=" * 60,
            "⚠️  SECURITY PATTERN REMOVAL DETECTED",
            "=" * 60,
            f"File: {result.file_path}" if result.file_path else "",
            f"Severity: {result.severity.name}",
            "",
            result.message,
            "",
        ]

        if result.removed_details:
            lines.append("Removed patterns:")
            for match in result.removed_details[:5]:
                lines.append(f"  Line {match.line_number} [{match.category}]:")
                lines.append(f"    {match.line_content[:70]}...")

            if len(result.removed_details) > 5:
                lines.append(f"  ... and {len(result.removed_details) - 5} more")

        lines.extend([
            "",
            "-" * 60,
            "Review this change carefully. Security controls should not",
            "be removed without explicit justification.",
            "-" * 60,
            ""
        ])

        return "\n".join(lines)


# Convenience function for simple use
def analyze_security_diff(
    old_content: str,
    new_content: str,
    file_path: str = ""
) -> DiffResult:
    """
    Quick analysis of security pattern changes between file versions.

    Args:
        old_content: Original file content
        new_content: New file content
        file_path: Optional path for context-aware severity

    Returns:
        DiffResult with analysis
    """
    analyzer = DiffAnalyzer()
    return analyzer.analyze_diff(old_content, new_content, file_path)


if __name__ == '__main__':
    # Example usage
    import sys

    if len(sys.argv) >= 3:
        with open(sys.argv[1], 'r') as f:
            old = f.read()
        with open(sys.argv[2], 'r') as f:
            new = f.read()

        result = analyze_security_diff(old, new, sys.argv[1])
        print(DiffAnalyzer().format_report(result))

        sys.exit(result.severity.value)
    else:
        print("Usage: python diff-analyzer.py <old_file> <new_file>")
        print("\nExample patterns detected:")
        for category, patterns in SECURITY_PATTERNS.items():
            print(f"  {category}: {len(patterns)} patterns")
