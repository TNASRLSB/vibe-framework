#!/usr/bin/env python3
"""
Security Guardian - Secret Detector Module

Specialized scanner for detecting exposed credentials and secrets.
Includes bundle scanning for client-side exposure.

Usage:
    python secret-detector.py <path>
    python secret-detector.py src/ --check-bundles
    python secret-detector.py . --entropy-check
"""

import json
import re
import sys
import math
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class SecretFinding:
    """Represents a detected secret"""
    id: str
    name: str
    severity: str
    provider: str
    file_path: str
    line_number: int
    matched_text: str  # Redacted version
    full_match: str    # For internal use, not displayed
    description: str
    remediation: str
    is_in_bundle: bool = False
    entropy: float = 0.0


class EntropyCalculator:
    """Calculate Shannon entropy for detecting random strings"""

    @staticmethod
    def calculate(data: str) -> float:
        """Calculate Shannon entropy of a string"""
        if not data:
            return 0.0

        entropy = 0.0
        length = len(data)
        freq = {}

        for char in data:
            freq[char] = freq.get(char, 0) + 1

        for count in freq.values():
            prob = count / length
            entropy -= prob * math.log2(prob)

        return entropy

    @staticmethod
    def is_high_entropy(data: str, threshold: float = 4.5) -> bool:
        """Check if string has high entropy (likely a secret)"""
        if len(data) < 16:
            return False
        return EntropyCalculator.calculate(data) > threshold


class SecretDetector:
    """Specialized secret detection scanner"""

    # Bundle/dist directories and files
    BUNDLE_PATTERNS = {
        'dist/', 'build/', 'public/', 'out/', '.next/',
        'bundle.js', 'main.js', 'app.js', 'vendor.js',
        '.min.js', '.bundle.js', '.chunk.js'
    }

    # Files that should NEVER contain secrets
    CLIENT_FILES = {
        '.jsx', '.tsx', '.vue', '.svelte',
        'components/', 'pages/', 'views/', 'screens/',
        'public/', 'static/', 'assets/'
    }

    def __init__(self, patterns_path: Optional[Path] = None):
        if patterns_path is None:
            patterns_path = Path(__file__).parent.parent / 'patterns' / 'secrets.json'

        self.patterns: Dict = {}
        self.compiled_patterns: Dict[str, re.Pattern] = {}
        self._load_patterns(patterns_path)

    def _load_patterns(self, path: Path):
        """Load secret patterns from JSON"""
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                self.patterns = json.load(f)

        # Compile all patterns
        for category_name, category_data in self.patterns.items():
            if category_name in ['version', 'last_updated', 'description']:
                continue

            if isinstance(category_data, dict) and 'patterns' in category_data:
                for pattern_data in category_data['patterns']:
                    pattern_id = pattern_data.get('id', '')
                    pattern_str = pattern_data.get('pattern', '')
                    if pattern_str:
                        try:
                            self.compiled_patterns[pattern_id] = re.compile(
                                pattern_str,
                                re.IGNORECASE | re.MULTILINE
                            )
                        except re.error:
                            pass

    def _redact_secret(self, secret: str, visible_chars: int = 4) -> str:
        """Redact most of a secret for safe display"""
        if len(secret) <= visible_chars * 2:
            return '*' * len(secret)
        return secret[:visible_chars] + '*' * (len(secret) - visible_chars * 2) + secret[-visible_chars:]

    def _is_bundle_file(self, file_path: str) -> bool:
        """Check if file is a client bundle"""
        path_lower = file_path.lower()
        for pattern in self.BUNDLE_PATTERNS:
            if pattern in path_lower:
                return True
        return False

    def _is_client_file(self, file_path: str) -> bool:
        """Check if file is client-side code"""
        path_lower = file_path.lower()
        for pattern in self.CLIENT_FILES:
            if pattern in path_lower:
                return True
        return False

    def _get_all_patterns(self) -> List[Tuple[str, Dict]]:
        """Flatten patterns into list of (id, pattern_data)"""
        result = []
        for category_name, category_data in self.patterns.items():
            if category_name in ['version', 'last_updated', 'description']:
                continue
            if isinstance(category_data, dict) and 'patterns' in category_data:
                for pattern_data in category_data['patterns']:
                    result.append((pattern_data.get('id', ''), pattern_data))
        return result

    def scan_content(self, content: str, file_path: str) -> List[SecretFinding]:
        """Scan content for secrets"""
        findings: List[SecretFinding] = []
        lines = content.split('\n')
        is_bundle = self._is_bundle_file(file_path)
        is_client = self._is_client_file(file_path)

        for pattern_id, pattern_data in self._get_all_patterns():
            compiled = self.compiled_patterns.get(pattern_id)
            if not compiled:
                continue

            for match in compiled.finditer(content):
                matched_text = match.group(0)
                line_num = content[:match.start()].count('\n') + 1

                # Determine severity boost for client exposure
                base_severity = pattern_data.get('severity', 'HIGH')
                if is_bundle or is_client:
                    # Boost severity for client-exposed secrets
                    if base_severity == 'HIGH':
                        base_severity = 'CRITICAL'

                # Check if this looks like a real secret vs example/placeholder
                if self._is_likely_placeholder(matched_text, lines[line_num - 1]):
                    continue

                finding = SecretFinding(
                    id=pattern_id,
                    name=pattern_data.get('name', 'Unknown Secret'),
                    severity=base_severity,
                    provider=pattern_data.get('provider', 'Unknown'),
                    file_path=file_path,
                    line_number=line_num,
                    matched_text=self._redact_secret(matched_text),
                    full_match=matched_text,
                    description=pattern_data.get('description', ''),
                    remediation=pattern_data.get('remediation', ''),
                    is_in_bundle=is_bundle
                )
                findings.append(finding)

        return findings

    def _is_likely_placeholder(self, secret: str, line: str) -> bool:
        """Check if secret looks like a placeholder/example"""
        placeholder_indicators = [
            'example', 'placeholder', 'your_', 'your-', 'xxx', 'fake',
            'test', 'demo', 'sample', 'dummy', 'mock', 'todo',
            'replace_', 'change_me', 'insert_', '<', '>'
        ]

        secret_lower = secret.lower()
        line_lower = line.lower()

        for indicator in placeholder_indicators:
            if indicator in secret_lower or indicator in line_lower:
                return True

        # Check for obviously fake patterns
        if re.match(r'^[x]+$', secret, re.IGNORECASE):
            return True
        if re.match(r'^[0]+$', secret):
            return True
        if re.match(r'^(abc|123|test)+', secret, re.IGNORECASE):
            return True

        return False

    def scan_with_entropy(self, content: str, file_path: str,
                         min_length: int = 20, threshold: float = 4.5) -> List[SecretFinding]:
        """Scan for high-entropy strings that might be secrets"""
        findings: List[SecretFinding] = []
        lines = content.split('\n')

        # Pattern to find quoted strings or assignments
        string_pattern = re.compile(
            r'''(?:['"]([^'"]{20,})['"]\s*|=\s*['"]([^'"]{20,})['"])''',
            re.MULTILINE
        )

        for match in string_pattern.finditer(content):
            captured = match.group(1) or match.group(2)
            if not captured:
                continue

            entropy = EntropyCalculator.calculate(captured)
            if entropy < threshold:
                continue

            # Skip if it looks like a URL, path, or normal string
            if self._is_normal_string(captured):
                continue

            line_num = content[:match.start()].count('\n') + 1

            finding = SecretFinding(
                id='ENTROPY-001',
                name='High Entropy String',
                severity='MEDIUM',
                provider='Unknown',
                file_path=file_path,
                line_number=line_num,
                matched_text=self._redact_secret(captured),
                full_match=captured,
                description=f'High entropy string detected (entropy: {entropy:.2f}). May be a secret.',
                remediation='Review this string. If it is a secret, move to environment variable.',
                entropy=entropy
            )
            findings.append(finding)

        return findings

    def _is_normal_string(self, s: str) -> bool:
        """Check if string is likely normal content, not a secret"""
        # URLs
        if s.startswith(('http://', 'https://', 'ftp://', 'file://')):
            return True
        # File paths
        if '/' in s and s.count('/') > 2:
            return True
        # Email addresses
        if '@' in s and '.' in s:
            return True
        # UUIDs (these are often IDs, not secrets)
        if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', s, re.I):
            return True
        # Base64 images
        if s.startswith('data:image'):
            return True

        return False

    def scan_file(self, file_path: Path, entropy_check: bool = False) -> List[SecretFinding]:
        """Scan a single file for secrets"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            findings = self.scan_content(content, str(file_path))

            if entropy_check:
                findings.extend(self.scan_with_entropy(content, str(file_path)))

            return findings
        except Exception as e:
            print(f"Warning: Could not scan {file_path}: {e}", file=sys.stderr)
            return []

    def scan_directory(self, dir_path: Path, check_bundles: bool = True,
                      entropy_check: bool = False) -> List[SecretFinding]:
        """Scan directory for secrets"""
        findings: List[SecretFinding] = []

        skip_dirs = {'node_modules', '.git', '__pycache__', '.svn', 'vendor'}

        for path in dir_path.rglob('*'):
            # Skip non-files
            if not path.is_file():
                continue

            # Skip specified directories
            if any(skip in path.parts for skip in skip_dirs):
                continue

            # Determine if we should scan this file
            suffix = path.suffix.lower()
            is_bundle = self._is_bundle_file(str(path))

            # Always scan certain file types
            scannable = suffix in {
                '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
                '.py', '.rb', '.php', '.java', '.go', '.rs',
                '.json', '.yaml', '.yml', '.toml', '.xml',
                '.env', '.sh', '.bash', '.zsh',
                '.vue', '.svelte'
            }

            # Also scan bundles if requested
            if not scannable and check_bundles and is_bundle:
                scannable = True

            if scannable:
                findings.extend(self.scan_file(path, entropy_check))

        return findings


def format_findings(findings: List[SecretFinding]) -> str:
    """Format findings for display"""
    if not findings:
        return "✅ No secrets detected."

    lines = []
    lines.append("=" * 60)
    lines.append("SECRET DETECTION RESULTS")
    lines.append("=" * 60)
    lines.append("")

    # Sort by severity
    severity_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    findings.sort(key=lambda x: severity_order.get(x.severity, 99))

    # Count by severity
    counts = {}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    lines.append("Summary:")
    for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        if sev in counts:
            lines.append(f"  {sev}: {counts[sev]}")
    lines.append("")

    bundle_findings = [f for f in findings if f.is_in_bundle]
    if bundle_findings:
        lines.append("⚠️  CLIENT BUNDLE EXPOSURE DETECTED!")
        lines.append(f"   {len(bundle_findings)} secret(s) found in client-accessible code")
        lines.append("")

    lines.append("-" * 60)

    for finding in findings:
        icon = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢'
        }.get(finding.severity, '❓')

        bundle_warning = " [IN CLIENT BUNDLE!]" if finding.is_in_bundle else ""

        lines.append("")
        lines.append(f"{icon} [{finding.severity}] {finding.name}{bundle_warning}")
        lines.append(f"   Provider: {finding.provider}")
        lines.append(f"   Location: {finding.file_path}:{finding.line_number}")
        lines.append(f"   Matched: {finding.matched_text}")
        if finding.entropy > 0:
            lines.append(f"   Entropy: {finding.entropy:.2f}")
        lines.append(f"   {finding.description}")
        lines.append(f"   Remediation: {finding.remediation}")
        lines.append("-" * 60)

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Security Guardian - Secret Detector'
    )
    parser.add_argument('path', help='File or directory to scan')
    parser.add_argument(
        '--check-bundles',
        action='store_true',
        help='Include bundle/dist files in scan'
    )
    parser.add_argument(
        '--entropy-check',
        action='store_true',
        help='Use entropy analysis to detect unknown secrets'
    )
    parser.add_argument(
        '--format', '-f',
        choices=['text', 'json'],
        default='text',
        help='Output format'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output file'
    )

    args = parser.parse_args()

    detector = SecretDetector()
    path = Path(args.path).resolve()

    if path.is_file():
        findings = detector.scan_file(path, args.entropy_check)
    elif path.is_dir():
        findings = detector.scan_directory(path, args.check_bundles, args.entropy_check)
    else:
        print(f"Error: Path not found: {args.path}", file=sys.stderr)
        sys.exit(1)

    # Format output
    if args.format == 'json':
        output = json.dumps([{
            'id': f.id,
            'name': f.name,
            'severity': f.severity,
            'provider': f.provider,
            'file_path': f.file_path,
            'line_number': f.line_number,
            'matched_text': f.matched_text,
            'is_in_bundle': f.is_in_bundle
        } for f in findings], indent=2)
    else:
        output = format_findings(findings)

    # Write output
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Results written to {args.output}")
    else:
        print(output)

    # Exit code
    critical_high = sum(1 for f in findings if f.severity in ['CRITICAL', 'HIGH'])
    if critical_high > 0:
        sys.exit(2)
    elif findings:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()
