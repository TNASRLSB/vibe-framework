#!/usr/bin/env python3
"""
Heimdall - Import Checker Module

Detects potentially non-existent or typo'd package imports in AI-generated code.
Uses a static database of known packages (no network calls required).

Usage:
    from import_checker import ImportChecker

    checker = ImportChecker()
    issues = checker.check_file('/path/to/file.ts')

    for issue in issues:
        print(f"{issue.severity}: {issue.message}")
"""

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from enum import Enum


class IssueSeverity(Enum):
    """Severity levels for import issues"""
    INFO = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3


@dataclass
class ImportIssue:
    """Represents a detected import issue"""
    package: str
    line_number: int
    severity: IssueSeverity
    message: str
    suggestion: Optional[str] = None

    def to_dict(self) -> Dict:
        return {
            "package": self.package,
            "line": self.line_number,
            "severity": self.severity.name,
            "message": self.message,
            "suggestion": self.suggestion
        }


@dataclass
class Import:
    """Represents an extracted import statement"""
    package: str
    line_number: int
    is_relative: bool = False
    full_statement: str = ""


class ImportChecker:
    """Checks imports against known package database"""

    # Regex patterns for import extraction
    JS_IMPORT_PATTERNS = [
        # ES6 imports
        r'^import\s+.*?from\s+[\'"]([^\'"\./][^\'"]*)[\'"]',
        r'^import\s+[\'"]([^\'"\./][^\'"]*)[\'"]',
        # require statements
        r'require\s*\(\s*[\'"]([^\'"\./][^\'"]*)[\'"]',
        # dynamic imports
        r'import\s*\(\s*[\'"]([^\'"\./][^\'"]*)[\'"]',
    ]

    PY_IMPORT_PATTERNS = [
        # from X import Y
        r'^from\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s+import',
        # import X
        r'^import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
    ]

    GO_IMPORT_PATTERNS = [
        # import "package"
        r'import\s+[\'"]([^\'"]+)[\'"]',
        # import ( "package" )
        r'^\s*[\'"]([^\'"]+)[\'"]',
    ]

    RUST_IMPORT_PATTERNS = [
        # use crate::X or use X
        r'^use\s+([a-zA-Z_][a-zA-Z0-9_]*)',
        # extern crate X
        r'^extern\s+crate\s+([a-zA-Z_][a-zA-Z0-9_]*)',
    ]

    def __init__(self, data_path: Optional[Path] = None):
        """
        Initialize the checker with known packages database.

        Args:
            data_path: Path to known-packages.json. Uses default if not provided.
        """
        if data_path is None:
            data_path = Path(__file__).parent.parent / 'data' / 'known-packages.json'

        self.known_packages: Dict[str, Set[str]] = {}
        self.scoped_prefixes: Dict[str, List[str]] = {}
        self.typo_map: Dict[str, Dict[str, str]] = {}

        self._load_database(data_path)

    def _load_database(self, data_path: Path) -> None:
        """Load the known packages database"""
        if not data_path.exists():
            print(f"Warning: Package database not found at {data_path}")
            return

        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            for lang in ['javascript', 'python', 'go', 'rust']:
                if lang in data:
                    lang_data = data[lang]
                    self.known_packages[lang] = set(lang_data.get('packages', []))
                    self.scoped_prefixes[lang] = lang_data.get('scoped_prefixes', [])
                    self.typo_map[lang] = lang_data.get('common_typos', {})

        except Exception as e:
            print(f"Warning: Failed to load package database: {e}")

    def _detect_language(self, file_path: str) -> Optional[str]:
        """Detect language from file extension"""
        ext = Path(file_path).suffix.lower()

        if ext in {'.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte'}:
            return 'javascript'
        elif ext in {'.py', '.pyw', '.pyi'}:
            return 'python'
        elif ext in {'.go'}:
            return 'go'
        elif ext in {'.rs'}:
            return 'rust'

        return None

    def _get_patterns(self, language: str) -> List[re.Pattern]:
        """Get compiled regex patterns for language"""
        pattern_map = {
            'javascript': self.JS_IMPORT_PATTERNS,
            'python': self.PY_IMPORT_PATTERNS,
            'go': self.GO_IMPORT_PATTERNS,
            'rust': self.RUST_IMPORT_PATTERNS,
        }
        patterns = pattern_map.get(language, [])
        return [re.compile(p, re.MULTILINE) for p in patterns]

    def _extract_imports(self, content: str, language: str) -> List[Import]:
        """Extract import statements from content"""
        imports: List[Import] = []
        patterns = self._get_patterns(language)
        lines = content.split('\n')

        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()

            # Skip comments
            if stripped.startswith('//') or stripped.startswith('#'):
                continue

            for pattern in patterns:
                match = pattern.search(stripped)
                if match:
                    package = match.group(1)

                    # For Python, take only the top-level package
                    if language == 'python' and '.' in package:
                        package = package.split('.')[0]

                    # Skip relative imports
                    is_relative = package.startswith('.') or package.startswith('/')

                    if not is_relative:
                        imports.append(Import(
                            package=package,
                            line_number=line_num,
                            is_relative=is_relative,
                            full_statement=stripped[:100]
                        ))
                    break

        return imports

    def _is_known_package(self, package: str, language: str) -> bool:
        """Check if package is in the known database"""
        known = self.known_packages.get(language, set())

        # Direct match
        if package in known:
            return True

        # For JS, check scoped packages
        if language == 'javascript':
            prefixes = self.scoped_prefixes.get(language, [])
            for prefix in prefixes:
                if package.startswith(prefix):
                    return True

            # Extract base package from scoped (e.g., @org/pkg -> pkg might be known)
            if package.startswith('@') and '/' in package:
                base = package.split('/')[-1]
                if base in known:
                    return True

        return False

    def _is_internal_import(self, package: str, language: str, file_path: str) -> bool:
        """Check if import appears to be internal/local"""
        # Go standard library
        if language == 'go' and '/' not in package:
            return True

        # Common internal patterns
        internal_patterns = [
            r'^@/',  # Next.js aliases
            r'^~/',  # Common alias
            r'^src/',
            r'^lib/',
            r'^utils/',
            r'^components/',
            r'^services/',
            r'^hooks/',
            r'^store/',
            r'^api/',
            r'^config/',
        ]

        for pattern in internal_patterns:
            if re.match(pattern, package):
                return True

        return False

    def _find_typo_suggestion(self, package: str, language: str) -> Optional[str]:
        """Check if package matches a known typo"""
        typos = self.typo_map.get(language, {})
        return typos.get(package.lower())

    def _calculate_similarity(self, s1: str, s2: str) -> float:
        """Calculate Levenshtein similarity ratio"""
        if len(s1) == 0 or len(s2) == 0:
            return 0.0

        # Quick check
        if s1 == s2:
            return 1.0

        len1, len2 = len(s1), len(s2)
        if abs(len1 - len2) > max(len1, len2) * 0.5:
            return 0.0

        # Levenshtein distance
        dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]

        for i in range(len1 + 1):
            dp[i][0] = i
        for j in range(len2 + 1):
            dp[0][j] = j

        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                if s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])

        max_len = max(len1, len2)
        return 1.0 - (dp[len1][len2] / max_len)

    def _find_similar_package(self, package: str, language: str, threshold: float = 0.8) -> Optional[str]:
        """Find a similar known package (for fuzzy matching)"""
        known = self.known_packages.get(language, set())

        best_match = None
        best_score = threshold

        for known_pkg in known:
            score = self._calculate_similarity(package.lower(), known_pkg.lower())
            if score > best_score:
                best_score = score
                best_match = known_pkg

        return best_match

    def check_imports(
        self,
        content: str,
        file_path: str,
        language: Optional[str] = None
    ) -> List[ImportIssue]:
        """
        Check imports in content for potential issues.

        Args:
            content: Source code content
            file_path: Path to file (for language detection and context)
            language: Override language detection

        Returns:
            List of ImportIssue objects
        """
        if language is None:
            language = self._detect_language(file_path)

        if language is None:
            return []

        imports = self._extract_imports(content, language)
        issues: List[ImportIssue] = []

        for imp in imports:
            # Skip internal imports
            if self._is_internal_import(imp.package, language, file_path):
                continue

            # Check for known typos first (highest confidence)
            typo_suggestion = self._find_typo_suggestion(imp.package, language)
            if typo_suggestion:
                issues.append(ImportIssue(
                    package=imp.package,
                    line_number=imp.line_number,
                    severity=IssueSeverity.HIGH,
                    message=f"Likely typo in package name '{imp.package}'",
                    suggestion=f"Did you mean '{typo_suggestion}'?"
                ))
                continue

            # Check if unknown
            if not self._is_known_package(imp.package, language):
                # Try fuzzy matching
                similar = self._find_similar_package(imp.package, language)

                if similar:
                    issues.append(ImportIssue(
                        package=imp.package,
                        line_number=imp.line_number,
                        severity=IssueSeverity.MEDIUM,
                        message=f"Unknown package '{imp.package}' - possibly misspelled",
                        suggestion=f"Did you mean '{similar}'?"
                    ))
                else:
                    issues.append(ImportIssue(
                        package=imp.package,
                        line_number=imp.line_number,
                        severity=IssueSeverity.LOW,
                        message=f"Unknown package '{imp.package}' - verify it exists",
                        suggestion=None
                    ))

        return issues

    def check_file(self, file_path: str) -> List[ImportIssue]:
        """
        Check a file for import issues.

        Args:
            file_path: Path to file to check

        Returns:
            List of ImportIssue objects
        """
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            return self.check_imports(content, file_path)
        except Exception as e:
            print(f"Warning: Could not check {file_path}: {e}")
            return []

    def format_issues(self, issues: List[ImportIssue], file_path: str = "") -> str:
        """Format issues as human-readable string"""
        if not issues:
            return ""

        lines = [
            "",
            "=" * 50,
            "IMPORT CHECK RESULTS",
            "=" * 50,
        ]

        if file_path:
            lines.append(f"File: {file_path}")
            lines.append("")

        severity_icons = {
            IssueSeverity.HIGH: "HIGH",
            IssueSeverity.MEDIUM: "MEDIUM",
            IssueSeverity.LOW: "LOW",
            IssueSeverity.INFO: "INFO",
        }

        for issue in issues:
            icon = severity_icons.get(issue.severity, "")
            lines.append(f"[{icon}] Line {issue.line_number}: {issue.message}")
            if issue.suggestion:
                lines.append(f"       {issue.suggestion}")
            lines.append("")

        lines.append("=" * 50)

        return "\n".join(lines)


# Convenience function
def check_imports(content: str, file_path: str) -> List[ImportIssue]:
    """
    Quick check of imports in content.

    Args:
        content: Source code
        file_path: File path (for language detection)

    Returns:
        List of issues found
    """
    checker = ImportChecker()
    return checker.check_imports(content, file_path)


if __name__ == '__main__':
    import sys

    if len(sys.argv) >= 2:
        checker = ImportChecker()
        issues = checker.check_file(sys.argv[1])
        print(checker.format_issues(issues, sys.argv[1]))

        high_count = sum(1 for i in issues if i.severity == IssueSeverity.HIGH)
        sys.exit(2 if high_count > 0 else (1 if issues else 0))
    else:
        print("Usage: python import-checker.py <file_path>")
        print("\nSupported languages: JavaScript/TypeScript, Python, Go, Rust")
