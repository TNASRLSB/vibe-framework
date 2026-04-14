#!/usr/bin/env python3
"""
Heimdall - Iteration Tracker Module

Tracks AI code generation iterations per file to warn about security degradation.
Based on arXiv:2506.11022 research showing +37.6% vulnerabilities after 5 iterations.

Usage:
    python iteration-tracker.py increment <file_path>
    python iteration-tracker.py status [file_path]
    python iteration-tracker.py reset <file_path>
    python iteration-tracker.py report
"""

import json
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Optional, Any
from dataclasses import dataclass, asdict


# Configuration
STATE_DIR = '.heimdall'
STATE_FILE = 'state.json'
ITERATION_WARNING_THRESHOLD = 4
ITERATION_HIGH_THRESHOLD = 6
COMPLEXITY_WARNING_THRESHOLD = 0.3  # 30% increase


@dataclass
class FileState:
    """State for a tracked file"""
    iterations: int = 0
    first_seen: str = ""
    last_modified: str = ""
    complexity_baseline: int = 0
    complexity_current: int = 0
    warnings_shown: int = 0
    vulnerabilities_found: list = None

    def __post_init__(self):
        if self.vulnerabilities_found is None:
            self.vulnerabilities_found = []


@dataclass
class SessionState:
    """Overall session state"""
    version: str = "1.0.0"
    session_id: str = ""
    created: str = ""
    last_updated: str = ""
    files: Dict[str, Dict] = None
    session_stats: Dict[str, int] = None

    def __post_init__(self):
        if self.files is None:
            self.files = {}
        if self.session_stats is None:
            self.session_stats = {
                "total_scans": 0,
                "blocked_operations": 0,
                "warnings_issued": 0
            }


class IterationTracker:
    """Tracks AI iteration counts for files"""

    def __init__(self, project_root: Optional[Path] = None):
        if project_root is None:
            # Try to find project root
            project_root = Path(os.environ.get('CLAUDE_PROJECT_DIR', Path.cwd()))

        self.project_root = Path(project_root).resolve()
        self.state_dir = self.project_root / STATE_DIR
        self.state_file = self.state_dir / STATE_FILE
        self.state: SessionState = self._load_state()

    def _load_state(self) -> SessionState:
        """Load state from file or create new"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return SessionState(**data)
            except (json.JSONDecodeError, TypeError):
                pass

        # Create new state
        session_id = os.environ.get('CLAUDE_SESSION_ID', datetime.now().strftime('%Y%m%d%H%M%S'))
        return SessionState(
            session_id=session_id,
            created=datetime.now(timezone.utc).isoformat(),
            last_updated=datetime.now(timezone.utc).isoformat()
        )

    def _save_state(self):
        """Save state to file"""
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.state.last_updated = datetime.now(timezone.utc).isoformat()

        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(self.state), f, indent=2)

    def _normalize_path(self, file_path: str) -> str:
        """Normalize file path relative to project root"""
        try:
            path = Path(file_path).resolve()
            return str(path.relative_to(self.project_root))
        except ValueError:
            return file_path

    def increment(self, file_path: str) -> Dict[str, Any]:
        """Increment iteration count for a file"""
        normalized = self._normalize_path(file_path)
        now = datetime.now(timezone.utc).isoformat()

        if normalized not in self.state.files:
            self.state.files[normalized] = {
                "iterations": 0,
                "first_seen": now,
                "last_modified": now,
                "complexity_baseline": 0,
                "complexity_current": 0,
                "warnings_shown": 0,
                "vulnerabilities_found": []
            }

        file_state = self.state.files[normalized]
        file_state["iterations"] += 1
        file_state["last_modified"] = now

        self._save_state()

        return self._get_status_with_warning(normalized)

    def get_status(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Get status for a file or all files"""
        if file_path:
            normalized = self._normalize_path(file_path)
            return self._get_status_with_warning(normalized)
        else:
            return {
                "session_id": self.state.session_id,
                "session_stats": self.state.session_stats,
                "files": {
                    path: self._get_status_with_warning(path)
                    for path in self.state.files.keys()
                }
            }

    def _get_status_with_warning(self, normalized_path: str) -> Dict[str, Any]:
        """Get file status with warning level assessment"""
        if normalized_path not in self.state.files:
            return {
                "path": normalized_path,
                "iterations": 0,
                "warning_level": "none",
                "message": "File not tracked"
            }

        file_state = self.state.files[normalized_path]
        iterations = file_state["iterations"]

        # Determine warning level
        if iterations >= ITERATION_HIGH_THRESHOLD:
            warning_level = "high"
            message = self._format_high_warning(iterations)
        elif iterations >= ITERATION_WARNING_THRESHOLD:
            warning_level = "warning"
            message = self._format_warning(iterations)
        else:
            warning_level = "info"
            message = f"Iteration {iterations}/5 - Normal development"

        # Check complexity delta if available
        complexity_warning = None
        if file_state.get("complexity_baseline", 0) > 0:
            baseline = file_state["complexity_baseline"]
            current = file_state.get("complexity_current", baseline)
            delta = (current - baseline) / baseline if baseline > 0 else 0

            if delta > COMPLEXITY_WARNING_THRESHOLD:
                complexity_warning = f"Complexity increased by {delta*100:.1f}% from baseline"

        return {
            "path": normalized_path,
            "iterations": iterations,
            "first_seen": file_state.get("first_seen", ""),
            "last_modified": file_state.get("last_modified", ""),
            "complexity_baseline": file_state.get("complexity_baseline", 0),
            "complexity_current": file_state.get("complexity_current", 0),
            "warning_level": warning_level,
            "message": message,
            "complexity_warning": complexity_warning,
            "vulnerabilities_found": file_state.get("vulnerabilities_found", [])
        }

    def _format_warning(self, iterations: int) -> str:
        """Format warning message for moderate iteration count"""
        return (
            f"⚠️ Iteration {iterations}/5 - Consider human review.\n"
            f"Research shows 37.6% more vulnerabilities appear after 5 AI iterations.\n"
            f"(Source: arXiv:2506.11022, IEEE ISTAS 2025)"
        )

    def _format_high_warning(self, iterations: int) -> str:
        """Format warning message for high iteration count"""
        return (
            f"🔴 High iteration count: {iterations}\n"
            f"This file has been modified by AI {iterations} times without human review.\n"
            f"Research shows exponential vulnerability growth in this zone.\n"
            f"STRONGLY recommend security review before continuing.\n"
            f"\n"
            f"To reset after review: python iteration-tracker.py reset <file>\n"
            f"(Source: arXiv:2506.11022, IEEE ISTAS 2025)"
        )

    def reset(self, file_path: str) -> Dict[str, Any]:
        """Reset iteration count for a file (after human review)"""
        normalized = self._normalize_path(file_path)

        if normalized in self.state.files:
            self.state.files[normalized]["iterations"] = 0
            self.state.files[normalized]["last_modified"] = datetime.now(timezone.utc).isoformat()
            self.state.files[normalized]["warnings_shown"] = 0
            self._save_state()

            return {
                "path": normalized,
                "status": "reset",
                "message": f"Iteration count reset for {normalized}. Human review acknowledged."
            }
        else:
            return {
                "path": normalized,
                "status": "not_found",
                "message": f"File {normalized} not found in tracking state."
            }

    def update_complexity(self, file_path: str, complexity: int, is_baseline: bool = False):
        """Update complexity metrics for a file"""
        normalized = self._normalize_path(file_path)

        if normalized not in self.state.files:
            return

        if is_baseline or self.state.files[normalized].get("complexity_baseline", 0) == 0:
            self.state.files[normalized]["complexity_baseline"] = complexity

        self.state.files[normalized]["complexity_current"] = complexity
        self._save_state()

    def add_vulnerability(self, file_path: str, vulnerability_id: str):
        """Record a vulnerability found in a file"""
        normalized = self._normalize_path(file_path)

        if normalized not in self.state.files:
            return

        vulns = self.state.files[normalized].get("vulnerabilities_found", [])
        if vulnerability_id not in vulns:
            vulns.append(vulnerability_id)
            self.state.files[normalized]["vulnerabilities_found"] = vulns
            self._save_state()

    def increment_stat(self, stat_name: str):
        """Increment a session statistic"""
        if stat_name in self.state.session_stats:
            self.state.session_stats[stat_name] += 1
            self._save_state()

    def generate_report(self) -> str:
        """Generate a human-readable status report"""
        lines = []
        lines.append("=" * 60)
        lines.append("ITERATION TRACKING REPORT")
        lines.append("=" * 60)
        lines.append(f"Session ID: {self.state.session_id}")
        lines.append(f"Last updated: {self.state.last_updated}")
        lines.append("")

        # Session stats
        lines.append("Session Statistics:")
        for stat, value in self.state.session_stats.items():
            lines.append(f"  {stat}: {value}")
        lines.append("")

        if not self.state.files:
            lines.append("No files tracked in this session.")
            return "\n".join(lines)

        # Sort files by iteration count (highest first)
        sorted_files = sorted(
            self.state.files.items(),
            key=lambda x: x[1].get("iterations", 0),
            reverse=True
        )

        lines.append("Tracked Files:")
        lines.append("-" * 60)

        for path, file_state in sorted_files:
            iterations = file_state.get("iterations", 0)

            # Warning indicator
            if iterations >= ITERATION_HIGH_THRESHOLD:
                indicator = "🔴"
            elif iterations >= ITERATION_WARNING_THRESHOLD:
                indicator = "🟡"
            else:
                indicator = "🟢"

            lines.append(f"\n{indicator} {path}")
            lines.append(f"   Iterations: {iterations}")
            lines.append(f"   First seen: {file_state.get('first_seen', 'N/A')}")
            lines.append(f"   Last modified: {file_state.get('last_modified', 'N/A')}")

            # Complexity
            baseline = file_state.get("complexity_baseline", 0)
            current = file_state.get("complexity_current", 0)
            if baseline > 0:
                delta = ((current - baseline) / baseline) * 100 if baseline > 0 else 0
                lines.append(f"   Complexity: {current} (baseline: {baseline}, delta: {delta:+.1f}%)")

            # Vulnerabilities
            vulns = file_state.get("vulnerabilities_found", [])
            if vulns:
                lines.append(f"   Vulnerabilities found: {', '.join(vulns)}")

        # Summary
        lines.append("")
        lines.append("-" * 60)

        high_count = sum(1 for f in self.state.files.values()
                        if f.get("iterations", 0) >= ITERATION_HIGH_THRESHOLD)
        warning_count = sum(1 for f in self.state.files.values()
                          if ITERATION_WARNING_THRESHOLD <= f.get("iterations", 0) < ITERATION_HIGH_THRESHOLD)

        if high_count > 0:
            lines.append(f"⚠️  {high_count} file(s) in HIGH iteration zone - review recommended")
        if warning_count > 0:
            lines.append(f"ℹ️  {warning_count} file(s) approaching iteration threshold")
        if high_count == 0 and warning_count == 0:
            lines.append("✅ All files within normal iteration ranges")

        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Heimdall - Iteration Tracker'
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # increment command
    inc_parser = subparsers.add_parser('increment', help='Increment iteration count')
    inc_parser.add_argument('file_path', help='File path to increment')

    # status command
    status_parser = subparsers.add_parser('status', help='Get iteration status')
    status_parser.add_argument('file_path', nargs='?', help='File path (optional)')

    # reset command
    reset_parser = subparsers.add_parser('reset', help='Reset iteration count after review')
    reset_parser.add_argument('file_path', help='File path to reset')

    # report command
    subparsers.add_parser('report', help='Generate full status report')

    # Common options
    parser.add_argument('--project-root', '-p', help='Project root directory')
    parser.add_argument('--format', '-f', choices=['text', 'json'], default='text')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Initialize tracker
    project_root = Path(args.project_root) if args.project_root else None
    tracker = IterationTracker(project_root)

    # Execute command
    if args.command == 'increment':
        result = tracker.increment(args.file_path)
    elif args.command == 'status':
        result = tracker.get_status(args.file_path)
    elif args.command == 'reset':
        result = tracker.reset(args.file_path)
    elif args.command == 'report':
        if args.format == 'json':
            result = tracker.get_status()
        else:
            print(tracker.generate_report())
            sys.exit(0)

    # Output
    if args.format == 'json':
        print(json.dumps(result, indent=2))
    else:
        if isinstance(result, dict):
            if 'message' in result:
                print(result['message'])
            if 'warning_level' in result and result['warning_level'] in ['warning', 'high']:
                print(f"\nWarning Level: {result['warning_level'].upper()}")
            if 'complexity_warning' in result and result['complexity_warning']:
                print(f"\n⚠️  {result['complexity_warning']}")


if __name__ == '__main__':
    main()
