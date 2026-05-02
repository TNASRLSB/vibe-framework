#!/usr/bin/env python3
"""ACE observer — Reflector + Curator port for VIBE 5.8.0.

Adapted from references/hone/src/hone/observer.py. Differences from upstream:
  - No `hone.mutators` import; the reflector call is a `claude -p` subprocess
    (or short-circuited via VIBE_EVOLVE_MOCK_RESPONSE_FILE for tests).
  - Mutation log lives at ${CLAUDE_PROJECT_DIR}/.vibe/evolve_log.jsonl rather
    than a hone run_dir.
  - Managed block markers are VIBE-specific so they coexist with the existing
    `<!-- VIBE:managed-* -->` envelope written by `vibe:setup`.
  - Rollback gracefully no-ops on cold-start (no prior score window).

CLI:
  observer.py record <task_id> <score> <summary>
  observer.py reflect [--model <id>]
  observer.py revert
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

MANAGED_BLOCK_START = "<!-- VIBE:evolve-managed-start -->"
MANAGED_BLOCK_END   = "<!-- VIBE:evolve-managed-end -->"
MANAGED_CAP = 30
ROLLBACK_DELTA_DEFAULT = 0.05
TAIL_N_DEFAULT = 50


def _project_root() -> Path:
    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    return Path(root)


def _vibe_dir() -> Path:
    d = _project_root() / ".vibe"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _claude_md_path() -> Path:
    return _project_root() / "CLAUDE.md"


def _state_path() -> Path:
    return _vibe_dir() / "evolve-state.json"


def _log_path() -> Path:
    return _vibe_dir() / "evolve_log.jsonl"


def _history_path() -> Path:
    return _vibe_dir() / "evolve-history.jsonl"


def _versions_dir() -> Path:
    d = _vibe_dir() / "claude-md-versions"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _read_state() -> dict:
    p = _state_path()
    if not p.exists():
        return {"version": 0, "last_score_before": None}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {"version": 0, "last_score_before": None}


def _write_state(state: dict) -> None:
    _state_path().write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def _append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row) + "\n")


def _read_jsonl_tail(path: Path, n: int) -> list[dict]:
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    return [json.loads(l) for l in lines[-n:] if l.strip()]


def _now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---- Managed-block parsing / splicing ----------------------------------

def _extract_managed_block(md: str) -> dict[str, str]:
    m = re.search(
        re.escape(MANAGED_BLOCK_START) + r"(.*?)" + re.escape(MANAGED_BLOCK_END),
        md, flags=re.DOTALL,
    )
    if not m:
        return {}
    out: dict[str, str] = {}
    for line in m.group(1).splitlines():
        m2 = re.match(r"\s*-\s+(rule-\d+):\s+(.*\S)\s*$", line)
        if m2:
            out[m2.group(1)] = m2.group(2)
    return out


def _next_id(existing: dict[str, str]) -> str:
    n = 1
    while f"rule-{n:03d}" in existing:
        n += 1
    return f"rule-{n:03d}"


def _apply_deltas(existing: dict[str, str], deltas: list[dict]) -> dict[str, str]:
    new = dict(existing)
    for d in deltas:
        op = d.get("op")
        if op == "ADD":
            rid = d.get("id") or _next_id(new)
            new[rid] = d["text"]
        elif op == "MODIFY":
            if d.get("id") in new:
                new[d["id"]] = d["text"]
        elif op == "REMOVE":
            new.pop(d.get("id"), None)
        else:
            raise ValueError(f"unknown delta op: {op!r}")
    if len(new) > MANAGED_CAP:
        for rid in sorted(new.keys())[: len(new) - MANAGED_CAP]:
            new.pop(rid)
    return new


def _splice_managed_block(md: str, entries: dict[str, str], version: int) -> str:
    body = "\n".join(f"- {rid}: {txt}" for rid, txt in sorted(entries.items()))
    block = (
        f"{MANAGED_BLOCK_START}\n"
        f"<!-- managed by /vibe:evolve — version={version}. Do not hand-edit. -->\n"
        f"{body}\n"
        f"{MANAGED_BLOCK_END}"
    )
    if MANAGED_BLOCK_START in md and MANAGED_BLOCK_END in md:
        return re.sub(
            re.escape(MANAGED_BLOCK_START) + r".*?" + re.escape(MANAGED_BLOCK_END),
            lambda _: block, md, count=1, flags=re.DOTALL,
        )
    return md.rstrip() + "\n\n" + block + "\n"


def _strip_managed_block(md: str) -> str:
    if MANAGED_BLOCK_START not in md:
        return md
    body = (
        f"{MANAGED_BLOCK_START}\n"
        f"<!-- managed by /vibe:evolve — empty. -->\n"
        f"{MANAGED_BLOCK_END}"
    )
    return re.sub(
        re.escape(MANAGED_BLOCK_START) + r".*?" + re.escape(MANAGED_BLOCK_END),
        lambda _: body, md, count=1, flags=re.DOTALL,
    )


# ---- Reflector prompt + parsing ----------------------------------------

def _build_observer_prompt(log_tail: list[dict], managed: dict[str, str]) -> str:
    managed_repr = "\n".join(f"  - {k}: {v}" for k, v in sorted(managed.items())) or "  (empty)"
    trace = json.dumps(log_tail, indent=2)[:8000]
    return (
        "You are the ACE Reflector for the VIBE Framework. Read the recent task\n"
        "outcomes and propose edits to the project's CLAUDE.md managed rules so\n"
        "future sessions of the agent avoid repeated mistakes.\n\n"
        "Format your output as STRICT JSON (no prose around it):\n"
        '  {"reasoning": "...", "deltas": [{"op": "ADD"|"MODIFY"|"REMOVE", "id": "rule-NNN", "text": "..."}]}\n'
        "ADDs may omit id. MODIFYs and REMOVEs require id.\n\n"
        f"=== CURRENT MANAGED RULES ===\n{managed_repr}\n\n"
        f"=== RECENT TASK OUTCOMES (last {len(log_tail)}) ===\n{trace}\n\n"
        "Propose the MINIMAL set of delta entries. Empty deltas list is valid if\n"
        "no pattern is visible. Do not restate existing rules. Prefer MODIFY over\n"
        "ADD+REMOVE.\n"
    )


def _parse_observer_response(text: str) -> dict:
    m = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not m:
        raise ValueError("no JSON object in observer response")
    data = json.loads(m.group(0))
    if "deltas" not in data or not isinstance(data["deltas"], list):
        raise ValueError("observer response missing `deltas` list")
    return data


def _call_reflector(prompt: str, model: str) -> str:
    """Invoke the reflector. Tests can short-circuit via env var."""
    mock_path = os.environ.get("VIBE_EVOLVE_MOCK_RESPONSE_FILE")
    if mock_path:
        return Path(mock_path).read_text(encoding="utf-8")
    proc = subprocess.run(
        ["claude", "-p", prompt, "--model", model,
         "--thinking-display", "summarized"],
        capture_output=True, text=True, timeout=120, check=False,
    )
    return proc.stdout


# ---- Public CLI commands -----------------------------------------------

def cmd_record(args: argparse.Namespace) -> int:
    if os.environ.get("VIBE_NO_EVOLVE") == "1":
        return 0
    try:
        score = float(args.score)
    except ValueError:
        print(f"evolve record: score must be a float in [0,1] (got {args.score!r})",
              file=sys.stderr)
        return 2
    if not (0.0 <= score <= 1.0):
        print(f"evolve record: score must be in [0,1] (got {score})", file=sys.stderr)
        return 2
    row = {
        "ts": _now_iso(),
        "task_id": args.task_id,
        "score": score,
        "summary": args.summary,
    }
    _append_jsonl(_log_path(), row)
    print(f"evolve: recorded task {args.task_id!r} score={score:.2f}")
    return 0


def cmd_reflect(args: argparse.Namespace) -> int:
    if os.environ.get("VIBE_NO_EVOLVE") == "1":
        return 0

    state = _read_state()
    log_tail = _read_jsonl_tail(
        _log_path(), int(os.environ.get("VIBE_EVOLVE_TAIL_N", TAIL_N_DEFAULT))
    )

    # Rollback check (cold-start safe: skip if no prior score window)
    last_before = state.get("last_score_before")
    rollback_delta = float(os.environ.get("VIBE_EVOLVE_ROLLBACK_DELTA",
                                          ROLLBACK_DELTA_DEFAULT))
    if last_before is not None and len(log_tail) >= 5:
        recent_scores = [r["score"] for r in log_tail if "score" in r][-5:]
        after = sum(recent_scores) / len(recent_scores) if recent_scores else None
        if after is not None and after < (last_before - rollback_delta):
            md = _claude_md_path().read_text(encoding="utf-8")
            new_md = _strip_managed_block(md)
            _claude_md_path().write_text(new_md, encoding="utf-8")
            new_version = max(0, state["version"] - 1)
            _write_state({"version": new_version, "last_score_before": None})
            _append_jsonl(_history_path(), {
                "ts": _now_iso(), "event": "rollback",
                "from_version": state["version"], "to_version": new_version,
                "score_before": last_before, "score_after": after,
            })
            print(f"evolve reflect: ROLLBACK applied (avg dropped {last_before:.2f} → {after:.2f}); "
                  f"managed block stripped, version {state['version']} → {new_version}")
            return 0

    if not _claude_md_path().exists():
        print("evolve reflect: CLAUDE.md not found in project root", file=sys.stderr)
        return 1

    md = _claude_md_path().read_text(encoding="utf-8")
    managed = _extract_managed_block(md)
    prompt = _build_observer_prompt(log_tail, managed)
    model = args.model or os.environ.get("VIBE_EVOLVE_MODEL", "sonnet-4-6")

    try:
        response = _call_reflector(prompt, model)
    except subprocess.TimeoutExpired:
        print("evolve reflect: reflector timeout (120s) — no-op", file=sys.stderr)
        _append_jsonl(_history_path(), {"ts": _now_iso(), "event": "timeout",
                                          "version": state["version"]})
        return 0
    except FileNotFoundError:
        print("evolve reflect: `claude` CLI not found on PATH — skipped", file=sys.stderr)
        return 0

    try:
        payload = _parse_observer_response(response)
    except ValueError as e:
        print(f"evolve reflect: malformed reflector response — no-op ({e})", file=sys.stderr)
        _append_jsonl(_history_path(), {
            "ts": _now_iso(), "event": "parse_error", "error": str(e),
            "version": state["version"],
        })
        return 0

    deltas = payload.get("deltas", [])
    if not deltas:
        _append_jsonl(_history_path(), {
            "ts": _now_iso(), "event": "no_deltas", "version": state["version"],
            "reasoning": payload.get("reasoning", ""),
        })
        print("evolve reflect: reflector proposed no deltas — managed block unchanged")
        return 0

    new_managed = _apply_deltas(managed, deltas)
    new_version = state["version"] + 1
    new_md = _splice_managed_block(md, new_managed, new_version)
    _claude_md_path().write_text(new_md, encoding="utf-8")
    _save_md_version(new_md, new_version)

    new_score_before = None
    scores = [r["score"] for r in log_tail if "score" in r][-5:]
    if scores:
        new_score_before = sum(scores) / len(scores)

    _write_state({"version": new_version, "last_score_before": new_score_before})
    _append_jsonl(_history_path(), {
        "ts": _now_iso(), "event": "applied", "version": new_version,
        "deltas": deltas, "reasoning": payload.get("reasoning", ""),
        "sha256_after": hashlib.sha256(new_md.encode()).hexdigest(),
    })
    print(f"evolve reflect: applied {len(deltas)} delta(s); managed block now version {new_version}")
    return 0


def cmd_revert(args: argparse.Namespace) -> int:
    if os.environ.get("VIBE_NO_EVOLVE") == "1":
        return 0
    if not _claude_md_path().exists():
        print("evolve revert: CLAUDE.md not found", file=sys.stderr)
        return 1
    md = _claude_md_path().read_text(encoding="utf-8")
    if MANAGED_BLOCK_START not in md:
        print("evolve revert: no managed block to revert")
        return 0
    new_md = _strip_managed_block(md)
    _claude_md_path().write_text(new_md, encoding="utf-8")
    state = _read_state()
    new_version = max(0, state["version"] - 1)
    _write_state({"version": new_version, "last_score_before": None})
    _append_jsonl(_history_path(), {
        "ts": _now_iso(), "event": "manual_revert",
        "from_version": state["version"], "to_version": new_version,
    })
    print(f"evolve revert: managed block stripped; version {state['version']} → {new_version}")
    return 0


def _save_md_version(md: str, version: int) -> None:
    vd = _versions_dir()
    (vd / f"v{version:03d}.md").write_text(md, encoding="utf-8")
    (vd / "current.md").write_text(md, encoding="utf-8")


# ---- argv dispatch ------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="evolve", description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    p_rec = sub.add_parser("record", help="Append a scored task outcome to the evolve log.")
    p_rec.add_argument("task_id")
    p_rec.add_argument("score")
    p_rec.add_argument("summary", nargs="+")
    p_rec.set_defaults(func=cmd_record)

    p_ref = sub.add_parser("reflect", help="Fire the ACE reflector + curator.")
    p_ref.add_argument("--model", default=None)
    p_ref.set_defaults(func=cmd_reflect)

    p_rev = sub.add_parser("revert", help="Strip the evolve managed block.")
    p_rev.set_defaults(func=cmd_revert)

    ns = p.parse_args(argv)
    if ns.cmd == "record":
        ns.summary = " ".join(ns.summary)
    return ns.func(ns)


if __name__ == "__main__":
    sys.exit(main())
