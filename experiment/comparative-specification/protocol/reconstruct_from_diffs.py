#!/usr/bin/env python3
"""Rebuild contestant files from search_replace unified diffs in a transcript."""
import json, re, sys
from pathlib import Path


def parse_path(ds: str):
    m = re.search(r"^\+\+\+ b/(.+)$", ds, re.M)
    if not m:
        return None
    path = m.group(1)
    if path.startswith("//"):
        path = path[1:]
    if not path.startswith("/"):
        path = "/" + path
    return path


def apply_new_file(ds: str) -> str:
    lines = []
    in_hunk = False
    for line in ds.splitlines():
        if line.startswith("@@"):
            in_hunk = True
            continue
        if not in_hunk:
            continue
        if line.startswith("+"):
            lines.append(line[1:])
        elif line.startswith(" "):
            lines.append(line[1:])
    return "\n".join(lines) + ("\n" if lines else "")


def apply_unified(current: str, ds: str) -> str:
    if any(l.startswith("--- /dev/null") for l in ds.splitlines()[:8]):
        return apply_new_file(ds)
    rows = current.splitlines()
    hunks = re.split(r"(?=^@@)", ds, flags=re.M)
    for hunk in hunks:
        if not hunk.startswith("@@"):
            continue
        hm = re.match(r"@@ -(\d+)", hunk.splitlines()[0])
        if not hm:
            continue
        old_start = int(hm.group(1))
        old_part, new_part = [], []
        for line in hunk.splitlines()[1:]:
            if line.startswith("+") and not line.startswith("+++"):
                new_part.append(line[1:])
            elif line.startswith("-") and not line.startswith("---"):
                old_part.append(line[1:])
            elif line.startswith(" "):
                old_part.append(line[1:])
                new_part.append(line[1:])
        if old_start == 0:
            rows = new_part
            continue
        idx = old_start - 1
        if rows[idx : idx + len(old_part)] == old_part:
            rows = rows[:idx] + new_part + rows[idx + len(old_part) :]
            continue
        found = None
        for i in range(0, max(1, len(rows) - len(old_part) + 1)):
            if rows[i : i + len(old_part)] == old_part:
                found = i
                break
        if found is None:
            rows = rows[:idx] + new_part + rows[idx + len(old_part) :]
        else:
            rows = rows[:found] + new_part + rows[found + len(old_part) :]
    return "\n".join(rows) + ("\n" if rows else "")


def reconstruct(transcript: Path, artifacts: Path, meta_path: Path):
    data = json.loads(transcript.read_text())
    files = {}
    events = []
    for m in data["messages"]:
        if m.get("role") != "tool" or m.get("tool_name") != "search_replace":
            continue
        val = (m.get("tool_result") or {}).get("value") or {}
        if not val.get("isApplied"):
            events.append({"skipped": True})
            continue
        for ch in (val.get("diff") or {}).get("chunks") or []:
            ds = ch.get("diffString") or ""
            path = parse_path(ds)
            if not path:
                events.append({"error": "no-path"})
                continue
            kind = "create" if path not in files and "--- /dev/null" in ds[:200] else (
                "create" if path not in files else "edit"
            )
            files[path] = apply_unified(files.get(path, ""), ds)
            events.append({"path": path, "kind": kind, "added": ch.get("linesAdded")})
    artifacts.mkdir(parents=True, exist_ok=True)
    written = []
    for path, text in sorted(files.items()):
        if path.startswith("/home/ubuntu/tower-spec-output/"):
            rel = path[len("/home/ubuntu/tower-spec-output/") :]
        elif path.startswith("/workspace/"):
            rel = "_workspace/" + path[len("/workspace/") :]
        else:
            rel = "_outside/" + path.lstrip("/")
        dest = artifacts / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text)
        written.append({"src": path, "dest": str(dest), "bytes": len(text.encode())})
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(
        json.dumps({"n_files": len(files), "written": written, "events": events}, indent=2)
    )
    return written


if __name__ == "__main__":
    written = reconstruct(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
    print(len(written), "files")
    for w in written:
        print(f"{w['bytes']:6d}  {w['dest']}")
