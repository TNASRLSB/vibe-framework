#!/usr/bin/env python3
"""
Security Guardian - BaaS Auditor Module

Specialized auditor for Backend-as-a-Service configurations.
Supports Supabase, Firebase, AWS Amplify, and PocketBase.

Based on Escape.tech research: 10.3% of vibe-coded apps have BaaS misconfigurations.

Usage:
    python baas-auditor.py <project_path>
    python baas-auditor.py . --provider supabase
    python baas-auditor.py . --provider firebase
"""

import json
import re
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class BaaSProvider(Enum):
    SUPABASE = "supabase"
    FIREBASE = "firebase"
    AMPLIFY = "amplify"
    POCKETBASE = "pocketbase"
    UNKNOWN = "unknown"


@dataclass
class BaaSFinding:
    """Represents a BaaS security finding"""
    id: str
    name: str
    severity: str
    provider: str
    file_path: str
    line_number: int
    issue: str
    description: str
    remediation: str
    config_type: str  # 'code', 'rules', 'config'
    real_world_case: str = ""


@dataclass
class BaaSProjectInfo:
    """Information about detected BaaS usage"""
    provider: BaaSProvider
    config_files: List[Path]
    client_usage_files: List[Path]
    env_files: List[Path]


class BaaSDetector:
    """Detect which BaaS providers are used in a project"""

    PROVIDER_SIGNATURES = {
        BaaSProvider.SUPABASE: {
            'imports': [
                r'@supabase/supabase-js',
                r'from\s+[\'"]@supabase',
                r'createClient.*supabase',
                r'supabaseUrl',
                r'SUPABASE_'
            ],
            'config_files': [
                'supabase/config.toml',
                'supabase/.env',
                '.env.local'  # Common location for Supabase keys
            ],
            'env_vars': ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE']
        },
        BaaSProvider.FIREBASE: {
            'imports': [
                r'firebase/app',
                r'firebase-admin',
                r'@firebase/',
                r'initializeApp.*firebase',
                r'FIREBASE_'
            ],
            'config_files': [
                'firebase.json',
                'firestore.rules',
                'storage.rules',
                'database.rules.json',
                '.firebaserc'
            ],
            'env_vars': ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID']
        },
        BaaSProvider.AMPLIFY: {
            'imports': [
                r'aws-amplify',
                r'@aws-amplify/',
                r'Amplify\.configure',
                r'aws-exports'
            ],
            'config_files': [
                'amplify/backend/api/*/schema.graphql',
                'aws-exports.js',
                'amplifyconfiguration.json'
            ],
            'env_vars': ['AWS_AMPLIFY_', 'AMPLIFY_']
        },
        BaaSProvider.POCKETBASE: {
            'imports': [
                r'pocketbase',
                r'PocketBase',
                r'pb\.collection'
            ],
            'config_files': [
                'pb_schema.json',
                'pocketbase/'
            ],
            'env_vars': ['POCKETBASE_URL']
        }
    }

    def detect(self, project_path: Path) -> List[BaaSProjectInfo]:
        """Detect BaaS providers used in project"""
        detected = []

        for provider, signatures in self.PROVIDER_SIGNATURES.items():
            info = self._check_provider(project_path, provider, signatures)
            if info:
                detected.append(info)

        return detected

    def _check_provider(self, project_path: Path, provider: BaaSProvider,
                       signatures: Dict) -> Optional[BaaSProjectInfo]:
        """Check if a specific provider is used"""
        config_files = []
        client_files = []
        env_files = []

        # Check for config files
        for config_pattern in signatures.get('config_files', []):
            for match in project_path.glob(f'**/{config_pattern}'):
                if 'node_modules' not in str(match):
                    config_files.append(match)

        # Check source files for imports
        import_patterns = [re.compile(p, re.IGNORECASE) for p in signatures.get('imports', [])]

        for ext in ['*.js', '*.jsx', '*.ts', '*.tsx', '*.vue', '*.svelte']:
            for file_path in project_path.glob(f'**/{ext}'):
                if 'node_modules' in str(file_path) or 'dist' in str(file_path):
                    continue
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    for pattern in import_patterns:
                        if pattern.search(content):
                            client_files.append(file_path)
                            break
                except:
                    pass

        # Check for env files with provider vars
        for env_file in project_path.glob('**/.env*'):
            if 'node_modules' not in str(env_file):
                try:
                    content = env_file.read_text(encoding='utf-8', errors='ignore')
                    for var in signatures.get('env_vars', []):
                        if var in content:
                            env_files.append(env_file)
                            break
                except:
                    pass

        # Return info if any evidence found
        if config_files or client_files or env_files:
            return BaaSProjectInfo(
                provider=provider,
                config_files=list(set(config_files)),
                client_usage_files=list(set(client_files)),
                env_files=list(set(env_files))
            )

        return None


class BaaSAuditor:
    """Main BaaS security auditor"""

    def __init__(self, patterns_path: Optional[Path] = None):
        if patterns_path is None:
            patterns_path = Path(__file__).parent.parent / 'patterns' / 'baas-misconfig.json'

        self.patterns: Dict = {}
        self._load_patterns(patterns_path)
        self.detector = BaaSDetector()

    def _load_patterns(self, path: Path):
        """Load BaaS patterns from JSON"""
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                self.patterns = json.load(f)

    def audit(self, project_path: Path,
             specific_provider: Optional[str] = None) -> List[BaaSFinding]:
        """Run full BaaS security audit"""
        findings: List[BaaSFinding] = []

        # Detect providers
        detected_providers = self.detector.detect(project_path)

        if not detected_providers:
            return findings

        # Filter to specific provider if requested
        if specific_provider:
            provider_enum = BaaSProvider(specific_provider.lower())
            detected_providers = [p for p in detected_providers if p.provider == provider_enum]

        # Audit each detected provider
        for provider_info in detected_providers:
            provider_name = provider_info.provider.value

            # Audit config files
            for config_file in provider_info.config_files:
                findings.extend(self._audit_config_file(config_file, provider_name))

            # Audit client usage files
            for client_file in provider_info.client_usage_files:
                findings.extend(self._audit_client_file(client_file, provider_name))

            # Audit env files
            for env_file in provider_info.env_files:
                findings.extend(self._audit_env_file(env_file, provider_name))

        return findings

    def _audit_config_file(self, file_path: Path, provider: str) -> List[BaaSFinding]:
        """Audit a BaaS configuration file"""
        findings = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        except:
            return findings

        provider_patterns = self.patterns.get(provider, {}).get('patterns', [])

        # Also check SQL patterns for Supabase
        if provider == 'supabase':
            provider_patterns.extend(self.patterns.get('supabase', {}).get('sql_checks', []))

        for pattern_data in provider_patterns:
            if pattern_data.get('check_type') not in ['rules_pattern', 'config_pattern', None]:
                continue

            pattern_str = pattern_data.get('pattern', '')
            if not pattern_str:
                continue

            try:
                compiled = re.compile(pattern_str, re.IGNORECASE | re.MULTILINE)
                for match in compiled.finditer(content):
                    line_num = content[:match.start()].count('\n') + 1

                    finding = BaaSFinding(
                        id=pattern_data.get('id', ''),
                        name=pattern_data.get('name', ''),
                        severity=pattern_data.get('severity', 'MEDIUM'),
                        provider=provider,
                        file_path=str(file_path),
                        line_number=line_num,
                        issue=pattern_data.get('issue', ''),
                        description=pattern_data.get('description', ''),
                        remediation=pattern_data.get('remediation', ''),
                        config_type='config',
                        real_world_case=pattern_data.get('real_world_case', '')
                    )
                    findings.append(finding)
            except re.error:
                pass

        return findings

    def _audit_client_file(self, file_path: Path, provider: str) -> List[BaaSFinding]:
        """Audit client-side BaaS usage"""
        findings = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        except:
            return findings

        provider_patterns = self.patterns.get(provider, {}).get('patterns', [])

        # Also check general BaaS patterns
        general_patterns = self.patterns.get('general_baas', {}).get('patterns', [])
        all_patterns = provider_patterns + general_patterns

        for pattern_data in all_patterns:
            if pattern_data.get('check_type') not in ['code_pattern', None]:
                continue

            pattern_str = pattern_data.get('pattern', '')
            if not pattern_str:
                continue

            try:
                compiled = re.compile(pattern_str, re.IGNORECASE | re.MULTILINE)
                for match in compiled.finditer(content):
                    line_num = content[:match.start()].count('\n') + 1

                    # Check if this is in a comment
                    lines = content.split('\n')
                    if line_num <= len(lines):
                        line = lines[line_num - 1]
                        if line.strip().startswith('//') or line.strip().startswith('#'):
                            continue

                    finding = BaaSFinding(
                        id=pattern_data.get('id', ''),
                        name=pattern_data.get('name', ''),
                        severity=pattern_data.get('severity', 'MEDIUM'),
                        provider=provider,
                        file_path=str(file_path),
                        line_number=line_num,
                        issue=pattern_data.get('issue', pattern_data.get('description', '')),
                        description=pattern_data.get('description', ''),
                        remediation=pattern_data.get('remediation', ''),
                        config_type='code',
                        real_world_case=pattern_data.get('real_world_case', '')
                    )
                    findings.append(finding)
            except re.error:
                pass

        return findings

    def _audit_env_file(self, file_path: Path, provider: str) -> List[BaaSFinding]:
        """Audit environment files for BaaS misconfigurations"""
        findings = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        except:
            return findings

        lines = content.split('\n')

        # Check for exposed service keys
        danger_patterns = {
            'supabase': [
                (r'NEXT_PUBLIC.*SERVICE.*ROLE', 'Service role key exposed via NEXT_PUBLIC'),
                (r'VITE.*SERVICE.*ROLE', 'Service role key exposed via VITE env'),
                (r'REACT_APP.*SERVICE.*ROLE', 'Service role key exposed via REACT_APP'),
            ],
            'firebase': [
                (r'NEXT_PUBLIC.*PRIVATE_KEY', 'Private key exposed via NEXT_PUBLIC'),
                (r'VITE.*PRIVATE_KEY', 'Private key exposed via VITE env'),
            ]
        }

        for pattern_str, issue in danger_patterns.get(provider, []):
            try:
                compiled = re.compile(pattern_str, re.IGNORECASE)
                for i, line in enumerate(lines, 1):
                    if compiled.search(line):
                        finding = BaaSFinding(
                            id=f'{provider.upper()}-ENV-001',
                            name='Dangerous Environment Variable',
                            severity='CRITICAL',
                            provider=provider,
                            file_path=str(file_path),
                            line_number=i,
                            issue=issue,
                            description=f'{issue}. Public env vars are exposed to clients.',
                            remediation='Use server-side only env vars for sensitive keys (no NEXT_PUBLIC_, VITE_, or REACT_APP_ prefix)',
                            config_type='config',
                            real_world_case='Base44/Lovable breaches from exposed service keys'
                        )
                        findings.append(finding)
            except re.error:
                pass

        return findings


def format_findings(findings: List[BaaSFinding], providers: List[BaaSProjectInfo]) -> str:
    """Format findings for display"""
    lines = []
    lines.append("=" * 60)
    lines.append("BAAS SECURITY AUDIT RESULTS")
    lines.append("=" * 60)
    lines.append("")

    # Provider summary
    lines.append("Detected BaaS Providers:")
    for provider_info in providers:
        lines.append(f"  • {provider_info.provider.value.capitalize()}")
        if provider_info.config_files:
            lines.append(f"    Config files: {len(provider_info.config_files)}")
        if provider_info.client_usage_files:
            lines.append(f"    Client usage files: {len(provider_info.client_usage_files)}")
    lines.append("")

    if not findings:
        lines.append("✅ No BaaS security issues detected.")
        return "\n".join(lines)

    # Sort by severity
    severity_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    findings.sort(key=lambda x: severity_order.get(x.severity, 99))

    # Count by severity
    counts = {}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    lines.append("Findings Summary:")
    for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        if sev in counts:
            lines.append(f"  {sev}: {counts[sev]}")
    lines.append("")
    lines.append("-" * 60)

    for finding in findings:
        icon = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢'
        }.get(finding.severity, '❓')

        lines.append("")
        lines.append(f"{icon} [{finding.severity}] {finding.name}")
        lines.append(f"   Provider: {finding.provider.capitalize()}")
        lines.append(f"   Location: {finding.file_path}:{finding.line_number}")
        lines.append(f"   Type: {finding.config_type}")
        if finding.issue:
            lines.append(f"   Issue: {finding.issue}")
        lines.append(f"   Description: {finding.description}")
        lines.append(f"   Remediation: {finding.remediation}")
        if finding.real_world_case:
            lines.append(f"   Real-world case: {finding.real_world_case}")
        lines.append("-" * 60)

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Security Guardian - BaaS Security Auditor'
    )
    parser.add_argument('path', help='Project directory to audit')
    parser.add_argument(
        '--provider', '-p',
        choices=['supabase', 'firebase', 'amplify', 'pocketbase'],
        help='Audit specific provider only'
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

    auditor = BaaSAuditor()
    project_path = Path(args.path).resolve()

    if not project_path.is_dir():
        print(f"Error: {args.path} is not a directory", file=sys.stderr)
        sys.exit(1)

    # Detect providers
    providers = auditor.detector.detect(project_path)

    # Run audit
    findings = auditor.audit(project_path, args.provider)

    # Format output
    if args.format == 'json':
        output = json.dumps({
            'providers': [
                {
                    'name': p.provider.value,
                    'config_files': [str(f) for f in p.config_files],
                    'client_files': [str(f) for f in p.client_usage_files],
                    'env_files': [str(f) for f in p.env_files]
                } for p in providers
            ],
            'findings': [
                {
                    'id': f.id,
                    'name': f.name,
                    'severity': f.severity,
                    'provider': f.provider,
                    'file_path': f.file_path,
                    'line_number': f.line_number,
                    'issue': f.issue,
                    'remediation': f.remediation
                } for f in findings
            ]
        }, indent=2)
    else:
        output = format_findings(findings, providers)

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
