#!/usr/bin/env python3
"""
Heimdall - Core Scanner Module

Main scanning engine that coordinates vulnerability detection across all pattern databases.
Designed for AI-generated code with focus on vibe coding anti-patterns.

Usage:
    python scanner.py <path> [--format json|sarif|text] [--severity min_severity]
    python scanner.py src/auth.ts --format sarif --output results.sarif
    python scanner.py . --severity HIGH
"""

import json
import re
import sys
import os
import argparse
import fnmatch
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum


class Severity(Enum):
    """Vulnerability severity levels"""
    CRITICAL = 4
    HIGH = 3
    MEDIUM = 2
    LOW = 1
    INFO = 0

    @classmethod
    def from_string(cls, s: str) -> 'Severity':
        return cls[s.upper()]

    def __lt__(self, other):
        if isinstance(other, Severity):
            return self.value < other.value
        return NotImplemented

    def __ge__(self, other):
        if isinstance(other, Severity):
            return self.value >= other.value
        return NotImplemented

    def __le__(self, other):
        if isinstance(other, Severity):
            return self.value <= other.value
        return NotImplemented

    def __gt__(self, other):
        if isinstance(other, Severity):
            return self.value > other.value
        return NotImplemented


@dataclass
class Finding:
    """Represents a single security finding"""
    id: str
    name: str
    severity: str
    description: str
    file_path: str
    line_number: int
    column: int = 0
    code_snippet: str = ""
    cwe: str = ""
    remediation: str = ""
    category: str = ""
    ai_specific: bool = False
    real_world_case: str = ""
    secure_alternative: Optional[Dict[str, str]] = None
    original_severity: str = ""  # Before path context adjustment
    path_context_reason: str = ""  # Why severity was adjusted

    def to_dict(self) -> Dict:
        result = asdict(self)
        # Only include secure_alternative if present
        if self.secure_alternative is None:
            del result['secure_alternative']
        if not self.original_severity:
            del result['original_severity']
        if not self.path_context_reason:
            del result['path_context_reason']
        return result


@dataclass
class ScanResult:
    """Aggregated scan results"""
    scan_time: str
    files_scanned: int
    total_findings: int
    findings_by_severity: Dict[str, int]
    findings: List[Finding]

    def to_dict(self) -> Dict:
        return {
            "scan_time": self.scan_time,
            "files_scanned": self.files_scanned,
            "total_findings": self.total_findings,
            "findings_by_severity": self.findings_by_severity,
            "findings": [f.to_dict() for f in self.findings]
        }


class PatternLoader:
    """Loads and manages security patterns from JSON files"""

    def __init__(self, patterns_dir: Path):
        self.patterns_dir = patterns_dir
        self.patterns: Dict[str, Any] = {}
        self._load_all_patterns()

    def _load_all_patterns(self):
        """Load all pattern files from the patterns directory"""
        pattern_files = [
            "owasp-top-10.json",
            "secrets.json",
            "baas-misconfig.json"
        ]

        for filename in pattern_files:
            filepath = self.patterns_dir / filename
            if filepath.exists():
                with open(filepath, 'r', encoding='utf-8') as f:
                    self.patterns[filename.replace('.json', '')] = json.load(f)

    def get_all_patterns(self) -> List[Dict]:
        """Get flattened list of all patterns"""
        all_patterns = []

        for source_name, source_data in self.patterns.items():
            # Skip metadata keys
            for category_key, category_data in source_data.items():
                if category_key in ['version', 'last_updated', 'description']:
                    continue

                if isinstance(category_data, dict) and 'patterns' in category_data:
                    for pattern in category_data['patterns']:
                        pattern['_source'] = source_name
                        pattern['_category'] = category_key
                        all_patterns.append(pattern)
                elif isinstance(category_data, dict) and 'name' in category_data:
                    # Handle nested structure
                    for key, value in category_data.items():
                        if key == 'patterns' and isinstance(value, list):
                            for pattern in value:
                                pattern['_source'] = source_name
                                pattern['_category'] = category_key
                                all_patterns.append(pattern)

        return all_patterns


class SecurityScanner:
    """Main security scanning engine"""

    # File extensions to scan
    SCANNABLE_EXTENSIONS = {
        '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
        '.py', '.pyw',
        '.rb',
        '.php',
        '.java', '.kt', '.scala',
        '.go',
        '.rs',
        '.c', '.cpp', '.h', '.hpp',
        '.cs',
        '.swift',
        '.vue', '.svelte',
        '.json', '.yaml', '.yml', '.toml',
        '.env', '.env.local', '.env.production',
        '.sql',
        '.graphql', '.gql',
        '.tf', '.hcl'
    }

    # Files/directories to skip
    SKIP_PATTERNS = {
        'node_modules', '.git', '.svn', 'vendor', 'dist', 'build',
        '__pycache__', '.pytest_cache', '.mypy_cache',
        'coverage', '.coverage', '.nyc_output',
        '.idea', '.vscode', '.vs',
        '*.min.js', '*.bundle.js', '*.chunk.js',
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        '.heimdall'
    }

    def __init__(self, patterns_dir: Optional[Path] = None):
        if patterns_dir is None:
            # Default to patterns directory relative to this script
            patterns_dir = Path(__file__).parent.parent / 'patterns'

        self.pattern_loader = PatternLoader(patterns_dir)
        self.patterns = self.pattern_loader.get_all_patterns()
        self.compiled_patterns: Dict[str, re.Pattern] = {}
        self._compile_patterns()

    def _compile_patterns(self):
        """Pre-compile regex patterns for performance"""
        for pattern_data in self.patterns:
            pattern_id = pattern_data.get('id', '')
            pattern_str = pattern_data.get('pattern', '')
            if pattern_str:
                try:
                    self.compiled_patterns[pattern_id] = re.compile(pattern_str, re.IGNORECASE | re.MULTILINE)
                except re.error as e:
                    print(f"Warning: Invalid regex pattern {pattern_id}: {e}", file=sys.stderr)

    def _should_skip(self, path: Path) -> bool:
        """Check if path should be skipped"""
        path_str = str(path)
        for skip in self.SKIP_PATTERNS:
            if skip.startswith('*'):
                if path_str.endswith(skip[1:]):
                    return True
            elif skip in path_str:
                return True
        return False

    def _is_scannable(self, path: Path) -> bool:
        """Check if file should be scanned"""
        if not path.is_file():
            return False
        if self._should_skip(path):
            return False
        # Check extension
        suffix = path.suffix.lower()
        if suffix in self.SCANNABLE_EXTENSIONS:
            return True
        # Check for extensionless files that might be config
        if suffix == '' and path.name in ['.env', 'Dockerfile', 'Makefile']:
            return True
        return False

    def _get_code_snippet(self, lines: List[str], line_num: int, context: int = 2) -> str:
        """Extract code snippet around the finding"""
        start = max(0, line_num - context - 1)
        end = min(len(lines), line_num + context)
        snippet_lines = []
        for i in range(start, end):
            prefix = ">>> " if i == line_num - 1 else "    "
            snippet_lines.append(f"{i+1:4d}{prefix}{lines[i].rstrip()}")
        return "\n".join(snippet_lines)

    def _is_in_comment(self, line: str, match_start: int) -> bool:
        """Check if match is inside a comment (basic heuristic)"""
        # Check for common comment patterns before the match
        before_match = line[:match_start]

        # Single-line comments
        if '//' in before_match or '#' in before_match:
            comment_start = max(before_match.rfind('//'), before_match.rfind('#'))
            if comment_start >= 0 and comment_start < match_start:
                return True

        # TODO: Improve multi-line comment detection
        return False

    def _adjust_severity_by_path(
        self,
        base_severity: str,
        file_path: str,
        pattern_data: Dict
    ) -> tuple[str, str]:
        """
        Adjust severity based on file path context.

        Args:
            base_severity: Original severity from pattern
            file_path: Path to the file being scanned
            pattern_data: Pattern definition with optional path_contexts

        Returns:
            Tuple of (adjusted_severity, reason)
        """
        path_contexts = pattern_data.get('path_contexts', [])

        if not path_contexts:
            return base_severity, ""

        for ctx in path_contexts:
            match_patterns = ctx.get('match', [])
            for pattern in match_patterns:
                # Handle glob-style patterns
                if fnmatch.fnmatch(file_path, f"*{pattern}*"):
                    return ctx.get('severity', base_severity), ctx.get('reason', "")
                # Also try direct substring match for directory patterns
                if pattern in file_path:
                    return ctx.get('severity', base_severity), ctx.get('reason', "")

        return base_severity, ""

    def scan_content(self, content: str, file_path: str) -> List[Finding]:
        """Scan content for security issues"""
        findings: List[Finding] = []
        lines = content.split('\n')

        for pattern_data in self.patterns:
            pattern_id = pattern_data.get('id', '')
            compiled = self.compiled_patterns.get(pattern_id)

            if not compiled:
                continue

            # Find all matches
            for match in compiled.finditer(content):
                # Calculate line number
                line_num = content[:match.start()].count('\n') + 1
                line = lines[line_num - 1] if line_num <= len(lines) else ""
                col = match.start() - content.rfind('\n', 0, match.start())

                # Skip if in comment (reduce false positives)
                if self._is_in_comment(line, col):
                    continue

                # Check for context requirements (e.g., service_role needs JWT context)
                requires_context = pattern_data.get('requires_context')
                if requires_context and requires_context not in content:
                    continue

                # Get base severity and adjust by path context
                base_severity = pattern_data.get('severity', 'MEDIUM')
                adjusted_severity, path_reason = self._adjust_severity_by_path(
                    base_severity, file_path, pattern_data
                )

                # Get secure_alternative if present
                secure_alt = pattern_data.get('secure_alternative')

                finding = Finding(
                    id=pattern_id,
                    name=pattern_data.get('name', ''),
                    severity=adjusted_severity,
                    description=pattern_data.get('description', ''),
                    file_path=file_path,
                    line_number=line_num,
                    column=col,
                    code_snippet=self._get_code_snippet(lines, line_num),
                    cwe=pattern_data.get('cwe', ''),
                    remediation=pattern_data.get('remediation', ''),
                    category=pattern_data.get('_category', ''),
                    ai_specific=pattern_data.get('ai_specific', False),
                    real_world_case=pattern_data.get('real_world_case', ''),
                    secure_alternative=secure_alt,
                    original_severity=base_severity if adjusted_severity != base_severity else "",
                    path_context_reason=path_reason
                )
                findings.append(finding)

        return findings

    def scan_file(self, file_path: Path) -> List[Finding]:
        """Scan a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            return self.scan_content(content, str(file_path))
        except Exception as e:
            print(f"Warning: Could not scan {file_path}: {e}", file=sys.stderr)
            return []

    def scan_directory(self, dir_path: Path, recursive: bool = True) -> List[Finding]:
        """Scan all files in a directory"""
        findings: List[Finding] = []

        if recursive:
            for path in dir_path.rglob('*'):
                if self._is_scannable(path):
                    findings.extend(self.scan_file(path))
        else:
            for path in dir_path.iterdir():
                if self._is_scannable(path):
                    findings.extend(self.scan_file(path))

        return findings

    def scan(self, path: str) -> ScanResult:
        """Main scan entry point"""
        target = Path(path).resolve()
        findings: List[Finding] = []
        files_scanned = 0

        if target.is_file():
            findings = self.scan_file(target)
            files_scanned = 1
        elif target.is_dir():
            for file_path in target.rglob('*'):
                if self._is_scannable(file_path):
                    findings.extend(self.scan_file(file_path))
                    files_scanned += 1
        else:
            raise ValueError(f"Path not found: {path}")

        # Count by severity
        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        for f in findings:
            sev = f.severity.upper()
            if sev in severity_counts:
                severity_counts[sev] += 1

        return ScanResult(
            scan_time=datetime.now(timezone.utc).isoformat(),
            files_scanned=files_scanned,
            total_findings=len(findings),
            findings_by_severity=severity_counts,
            findings=findings
        )


class OutputFormatter:
    """Format scan results for different output types"""

    @staticmethod
    def to_text(result: ScanResult, min_severity: Severity = Severity.LOW) -> str:
        """Format as human-readable text"""
        lines = []
        lines.append("=" * 60)
        lines.append("HEIMDALL SCAN RESULTS")
        lines.append("=" * 60)
        lines.append(f"Scan time: {result.scan_time}")
        lines.append(f"Files scanned: {result.files_scanned}")
        lines.append(f"Total findings: {result.total_findings}")
        lines.append("")
        lines.append("Findings by severity:")
        for sev, count in result.findings_by_severity.items():
            if count > 0:
                lines.append(f"  {sev}: {count}")
        lines.append("")
        lines.append("-" * 60)

        # Filter and sort findings
        filtered = [f for f in result.findings
                   if Severity.from_string(f.severity) >= min_severity]
        filtered.sort(key=lambda x: Severity.from_string(x.severity).value, reverse=True)

        for finding in filtered:
            severity_icon = {
                'CRITICAL': '🔴',
                'HIGH': '🟠',
                'MEDIUM': '🟡',
                'LOW': '🟢',
                'INFO': 'ℹ️'
            }.get(finding.severity, '❓')

            lines.append("")
            lines.append(f"{severity_icon} [{finding.severity}] {finding.name}")
            lines.append(f"   ID: {finding.id}")
            lines.append(f"   Location: {finding.file_path}:{finding.line_number}")
            if finding.cwe:
                lines.append(f"   CWE: {finding.cwe}")
            lines.append(f"   Description: {finding.description}")

            # Show path context adjustment if applicable
            if finding.original_severity and finding.path_context_reason:
                lines.append(f"   Severity adjusted: {finding.original_severity} → {finding.severity}")
                lines.append(f"   Reason: {finding.path_context_reason}")

            if finding.code_snippet:
                lines.append("")
                lines.append("   Code:")
                for snippet_line in finding.code_snippet.split('\n'):
                    lines.append(f"   {snippet_line}")
            if finding.remediation:
                lines.append("")
                lines.append(f"   Remediation: {finding.remediation}")

            # Show secure alternatives ("Did you mean?")
            if finding.secure_alternative:
                lines.append("")
                lines.append("   Did you mean?")
                desc = finding.secure_alternative.get('description', '')
                if desc:
                    lines.append(f"     {desc}")
                for key, value in finding.secure_alternative.items():
                    if key != 'description':
                        lines.append(f"     → [{key}] {value}")

            if finding.real_world_case:
                lines.append(f"   Real-world case: {finding.real_world_case}")
            if finding.ai_specific:
                lines.append("   ⚠️  AI-SPECIFIC: This is a common pattern in AI-generated code")
            lines.append("-" * 60)

        if not filtered:
            lines.append("")
            lines.append("✅ No findings at or above the specified severity level.")

        return "\n".join(lines)

    @staticmethod
    def to_json(result: ScanResult) -> str:
        """Format as JSON"""
        return json.dumps(result.to_dict(), indent=2)

    @staticmethod
    def to_sarif(result: ScanResult) -> str:
        """Format as SARIF (Static Analysis Results Interchange Format)"""
        sarif = {
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [{
                "tool": {
                    "driver": {
                        "name": "Heimdall",
                        "version": "1.0.0",
                        "informationUri": "https://github.com/your-org/heimdall",
                        "rules": []
                    }
                },
                "results": []
            }]
        }

        rules_seen = set()
        run = sarif["runs"][0]

        severity_to_level = {
            'CRITICAL': 'error',
            'HIGH': 'error',
            'MEDIUM': 'warning',
            'LOW': 'note',
            'INFO': 'note'
        }

        for finding in result.findings:
            # Add rule if not seen
            if finding.id not in rules_seen:
                rules_seen.add(finding.id)
                rule = {
                    "id": finding.id,
                    "name": finding.name,
                    "shortDescription": {"text": finding.name},
                    "fullDescription": {"text": finding.description},
                    "help": {
                        "text": finding.remediation,
                        "markdown": f"**Remediation:** {finding.remediation}"
                    },
                    "defaultConfiguration": {
                        "level": severity_to_level.get(finding.severity, 'warning')
                    }
                }
                if finding.cwe:
                    rule["properties"] = {"tags": [finding.cwe]}
                run["tool"]["driver"]["rules"].append(rule)

            # Add result
            result_obj = {
                "ruleId": finding.id,
                "level": severity_to_level.get(finding.severity, 'warning'),
                "message": {"text": finding.description},
                "locations": [{
                    "physicalLocation": {
                        "artifactLocation": {"uri": finding.file_path},
                        "region": {
                            "startLine": finding.line_number,
                            "startColumn": finding.column
                        }
                    }
                }]
            }
            run["results"].append(result_obj)

        return json.dumps(sarif, indent=2)


def main():
    parser = argparse.ArgumentParser(
        description='Heimdall - AI-aware code security scanner'
    )
    parser.add_argument('path', help='File or directory to scan')
    parser.add_argument(
        '--format', '-f',
        choices=['text', 'json', 'sarif'],
        default='text',
        help='Output format (default: text)'
    )
    parser.add_argument(
        '--severity', '-s',
        choices=['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'],
        default='LOW',
        help='Minimum severity to report (default: LOW)'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output file (default: stdout)'
    )
    parser.add_argument(
        '--patterns-dir', '-p',
        help='Custom patterns directory'
    )

    args = parser.parse_args()

    # Initialize scanner
    patterns_dir = Path(args.patterns_dir) if args.patterns_dir else None
    scanner = SecurityScanner(patterns_dir)

    # Run scan
    try:
        result = scanner.scan(args.path)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Format output
    min_severity = Severity.from_string(args.severity)

    if args.format == 'json':
        output = OutputFormatter.to_json(result)
    elif args.format == 'sarif':
        output = OutputFormatter.to_sarif(result)
    else:
        output = OutputFormatter.to_text(result, min_severity)

    # Write output
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Results written to {args.output}")
    else:
        print(output)

    # Exit with appropriate code
    critical_high = result.findings_by_severity.get('CRITICAL', 0) + result.findings_by_severity.get('HIGH', 0)
    if critical_high > 0:
        sys.exit(2)  # Block signal
    elif result.total_findings > 0:
        sys.exit(1)  # Warning
    else:
        sys.exit(0)  # Clean


if __name__ == '__main__':
    main()
