#!/usr/bin/env python3
"""Oracle gate scorer — VIBE 5.7.0 multi-layer Stop-hook analyzer.

Reads from stdin a JSON payload:
  { "message": "<last assistant message>",
    "transcript_path": "<path to .jsonl transcript>" }

Writes to stdout a JSON verdict:
  { "verdict": "PASS" | "SOFT_FAIL" | "HARD_FAIL",
    "rules_fired": [ {"id": ..., "severity": ..., "msg": ...}, ... ],
    "reason": "..." }

Exit codes: 0=PASS, 1=SOFT_FAIL, 2=HARD_FAIL.

Per-rule disable env vars:
  VIBE_ORACLE_RULE_1_DISABLED         hard: file:line cross-ref
  VIBE_ORACLE_RULE_2_DISABLED         soft: hype without receipt
  VIBE_ORACLE_RULE_3_DISABLED         soft: ≥3 options without recommendation
  VIBE_ORACLE_RULE_RUBRIC_DISABLED    soft: structural claim without receipt
  VIBE_ORACLE_RULE_THEATER_DISABLED   soft: theater detection
"""

import json
import os
import re
import sys
from pathlib import Path

TLD_EXCLUDE = {
    "com", "org", "net", "io", "dev", "ai", "co", "gov", "edu", "biz",
    "info", "us", "uk", "de", "fr", "it", "es", "jp", "cn", "br", "ca",
}
FILE_LINE_RE = re.compile(r"\b([\w./-]+\.[a-zA-Z]+):(\d+)\b")
HYPE_RE = re.compile(
    r"\b(amazing|perfect|100% correct|completely solved|magico|"
    r"production[- ]ready|magnificent|stunning)\b",
    re.IGNORECASE,
)
VERSION_TAG_RE = re.compile(
    r"\b(v\d+\.\d+(?:\.\d+)?|RC[-\s]?\d+|release[- ]?\w+|SHIP|FINAL)\b",
    re.IGNORECASE,
)
STRUCTURAL_VERB_RE = re.compile(
    r"\b(implements?|fixes?|fixed|adds?|added|removes?|removed|"
    r"refactors?|refactored|updates?|updated|introduces?|introduced|"
    r"deletes?|deleted|migrates?|migrated)\b",
    re.IGNORECASE,
)
RECOMMENDATION_RE = re.compile(
    r"\b(I recommend|go with|I'd (pick|choose)|the best|recommended option|"
    r"preferred option|my pick|I would pick|I would choose|"
    r"my recommendation|the right call)\b",
    re.IGNORECASE,
)


def rule_disabled(rule_id) -> bool:
    return os.environ.get(f"VIBE_ORACLE_RULE_{str(rule_id).upper()}_DISABLED") == "1"


def extract_file_line_claims(text):
    """File:line tokens, excluding URL TLD ports (.com:80 etc.)."""
    out = []
    for path, line in FILE_LINE_RE.findall(text):
        ext = path.rsplit(".", 1)[-1].lower()
        if ext in TLD_EXCLUDE:
            continue
        out.append((path, line))
    return out


def transcript_tool_files(transcript_path: str, last_n: int = 50) -> set:
    """Files touched by recent tool calls in the transcript window."""
    if not transcript_path or not Path(transcript_path).exists():
        return set()
    try:
        lines = Path(transcript_path).read_text(errors="replace").splitlines()
    except OSError:
        return set()

    files = set()
    seen = 0
    for raw in reversed(lines):
        if seen >= last_n:
            break
        try:
            entry = json.loads(raw)
        except json.JSONDecodeError:
            continue
        seen += 1
        msg = entry.get("message") or {}
        content = msg.get("content") or []
        if not isinstance(content, list):
            continue
        for c in content:
            if not isinstance(c, dict):
                continue
            if c.get("type") != "tool_use":
                continue
            tool = c.get("name") or ""
            ti = c.get("input") or {}
            if isinstance(ti, dict):
                fp = ti.get("file_path")
                if isinstance(fp, str) and fp:
                    files.add(fp)
                if tool == "Bash":
                    cmd = ti.get("command") or ""
                    if isinstance(cmd, str):
                        for m in re.findall(
                            r"\b(?:cat|head|tail|less|more|file)\s+(\S+)",
                            cmd,
                        ):
                            files.add(m.strip("'\""))
    return files


# ── Hard rule 1: unverified file:line assertion ─────────────────────────
def check_file_line_cross_ref(message: str, transcript_path: str):
    if rule_disabled(1):
        return None
    claims = extract_file_line_claims(message)
    if not claims:
        return None
    touched = transcript_tool_files(transcript_path)
    touched_basenames = {Path(f).name for f in touched}
    for claim_file, claim_line in claims:
        claim_basename = Path(claim_file).name
        if claim_file in touched:
            continue
        if claim_basename in touched_basenames:
            continue
        if any(claim_file in t for t in touched):
            continue
        if any(t.endswith(claim_file) for t in touched):
            continue
        return (
            f"unverified file:line claim — {claim_file}:{claim_line} "
            f"not seen in prior tool calls within window"
        )
    return None


# ── Rubric (soft): structural claim without file:line receipt ─────────────
def check_rubric(message: str):
    if rule_disabled("rubric"):
        return None
    msg = message.strip()
    if not msg:
        return None
    receipts = extract_file_line_claims(msg)
    if STRUCTURAL_VERB_RE.search(msg) and not receipts:
        return "structural claim (added/fixed/refactored/...) without file:line receipt"
    return None


# ── Theater detection (soft): version-tagged sections + bloat + no receipts + hype
def check_theater(message: str):
    if rule_disabled("theater"):
        return None
    sections = re.split(r"\n(?=#{2,3} )", message)
    if len(sections) < 3:
        return None
    theater_count = 0
    for s in sections:
        first_line = s.split("\n", 1)[0]
        if not VERSION_TAG_RE.search(first_line):
            continue
        body = s[len(first_line):]
        if len(body) < 500:
            continue
        if FILE_LINE_RE.search(body):
            continue
        if not HYPE_RE.search(s):
            continue
        theater_count += 1
    if not sections:
        return None
    ratio = theater_count / len(sections)
    if ratio > 0.3:
        return (
            f"theater detected — {theater_count}/{len(sections)} sections "
            f"(ratio {ratio:.2f}) match version-tag + bloat + no-receipts + hype"
        )
    return None


# ── Soft rule 2: hype without co-located file:line ───────────────────────
def check_hype(message: str):
    if rule_disabled(2):
        return None
    paragraphs = re.split(r"\n\s*\n", message)
    for p in paragraphs:
        if HYPE_RE.search(p) and not FILE_LINE_RE.search(p):
            return "hype phrasing without file:line evidence in same paragraph"
    return None


# ── Soft rule 3: ≥3 options without recommendation ───────────────────────
def check_three_options(message: str):
    if rule_disabled(3):
        return None
    numbered = re.findall(r"^\s*(\d+)[.)]\s+\S", message, re.MULTILINE)
    if len(numbered) < 3:
        return None
    if RECOMMENDATION_RE.search(message):
        return None
    return f"presents {len(numbered)} options without a recommendation"


def main() -> None:
    payload = json.load(sys.stdin)
    message = payload.get("message") or ""
    transcript = payload.get("transcript_path") or ""

    fired = []
    hard = check_file_line_cross_ref(message, transcript)
    if hard:
        fired.append({"id": 1, "severity": "hard", "msg": hard})

    for fn, rid in (
        (check_rubric, "rubric"),
        (check_theater, "theater"),
        (check_hype, 2),
        (check_three_options, 3),
    ):
        m = fn(message)
        if m:
            fired.append({"id": rid, "severity": "soft", "msg": m})

    has_hard = any(r["severity"] == "hard" for r in fired)
    has_soft = any(r["severity"] == "soft" for r in fired)

    if has_hard:
        verdict, exit_code = "HARD_FAIL", 2
        reason = next(r["msg"] for r in fired if r["severity"] == "hard")
    elif has_soft:
        verdict, exit_code = "SOFT_FAIL", 1
        reason = "; ".join(r["msg"] for r in fired)
    else:
        verdict, exit_code = "PASS", 0
        reason = ""

    print(json.dumps({
        "verdict": verdict,
        "rules_fired": fired,
        "reason": reason,
    }))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
