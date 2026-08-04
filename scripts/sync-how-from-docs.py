#!/usr/bin/env python3
"""Sync docs/register/how/*.md Clarity into src/app/register/howAnalysis/*.ts.

Matches nodes by question text. Preserves ids, parents, positions, epicOrder.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOW_DIR = ROOT / "docs" / "register" / "how"
TS_DIR = ROOT / "src" / "app" / "register" / "howAnalysis"

MAP = {
    "consultant-access": "consultantAccess.ts",
    "consultant-core": "consultantCore.ts",
    "consultant-governance": "consultantGovernance.ts",
    "contact-book": "contactBook.ts",
    "contact-consent": "contactConsent.ts",
    "contact-refresh": "contactRefresh.ts",
    "contact-silence": "contactSilence.ts",
    "operator-acquisition": "operatorAcquisition.ts",
    "operator-activation": "operatorActivation.ts",
    "operator-activation-state": "operatorActivationState.ts",
    "operator-audit-trail": "operatorAuditTrail.ts",
    "operator-book-readiness": "operatorBookReadiness.ts",
    "operator-commercial": "operatorCommercial.ts",
    "operator-configuration-libraries": "operatorConfigurationLibraries.ts",
    "operator-firm-bind": "operatorFirmBind.ts",
    "operator-firm-health": "operatorFirmHealth.ts",
    "operator-founder-controls": "operatorFounderControls.ts",
    "operator-oversight": "operatorOversight.ts",
    "operator-provision": "operatorProvision.ts",
    "operator-reference-data": "operatorReferenceData.ts",
    "operator-register-evolution": "operatorRegisterEvolution.ts",
    "operator-support": "operatorSupport.ts",
}


def norm(s: str) -> str:
    s = s.strip().lower()
    s = (
        s.replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("—", "-")
        .replace("–", "-")
    )
    return re.sub(r"\s+", " ", s)


def js(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def extract_statement(md: str) -> str | None:
    m = re.search(r"^\*\*Statement\*\*\s*\n((?:>[^\n]*\n)+)", md, re.M)
    if not m:
        return None
    lines = []
    for line in m.group(1).splitlines():
        line = line.strip()
        if line.startswith(">"):
            line = line[1:].strip()
        if line:
            lines.append(line)
    return re.sub(r"\s+", " ", " ".join(lines)).strip() or None


def extract_root_meta(md: str) -> tuple[str | None, list[str]]:
    m = re.search(r"^## Root — outcome\n(.*?)(?=^## |\Z)", md, re.M | re.S)
    if not m:
        return None, []
    body = m.group(1)
    when = None
    wm = re.search(r"\*\*Criteria — when:\*\*\s*([^\n]+)", body)
    if wm:
        when = wm.group(1).strip()
    conds: list[str] = []
    cm = re.search(r"\*\*Conditions:\*\*\s*([^\n]+)", body)
    if cm:
        conds = [x.strip() for x in re.split(r";\s*", cm.group(1).strip()) if x.strip()]
    return when, conds


def extract_sections(md: str) -> list[dict]:
    sections: list[dict] = []
    chunks = re.split(r"(?m)^(?=### |## (?!Root))", md)
    for chunk in chunks:
        qm = re.search(r"^\*\*Q:\*\*\s*([^\n]+)", chunk, re.M)
        if not qm:
            continue
        question = qm.group(1).strip()
        cm = re.search(
            r"^\*\*Clarity:\*\*\s*(.*?)(?=\n\*\*DNA|\n\*\*Criteria|\n\*\*Requirements|\n\| UI |\n---\n|\Z)",
            chunk,
            re.M | re.S,
        )
        if not cm:
            continue
        clarity = re.sub(r"\s+", " ", cm.group(1).strip())
        if not clarity or clarity.startswith("*("):
            continue
        when = None
        wm = re.search(r"\*\*Criteria — when:\*\*\s*([^\n]+)", chunk)
        if wm:
            when = wm.group(1).strip()
        conds: list[str] = []
        cdm = re.search(r"\*\*Conditions:\*\*\s*([^\n]+)", chunk)
        if cdm:
            conds = [x.strip() for x in re.split(r";\s*", cdm.group(1).strip()) if x.strip()]
        ui: list[str] = []
        in_table = False
        for line in chunk.splitlines():
            if line.startswith("| UI |"):
                in_table = True
                continue
            if in_table:
                if not line.startswith("|"):
                    break
                if re.match(r"\|\s*---", line):
                    continue
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                name = re.sub(r"\*\*", "", cells[0]).strip()
                if name and name not in ui:
                    ui.append(name)
        sections.append(
            {
                "question": question,
                "clarity": clarity,
                "when": when,
                "conditions": conds,
                "ui": ui,
            }
        )
    return sections


def replace_string_field(block: str, field: str, value: str) -> tuple[str, bool]:
    m = re.search(rf'({field}: )("(?:\\.|[^"\\])*"|null)', block)
    if not m:
        return block, False
    new = js(value)
    if m.group(2) == new:
        return block, False
    return block[: m.start(2)] + new + block[m.end(2) :], True


def replace_conditions(block: str, conds: list[str]) -> tuple[str, bool]:
    if not conds:
        return block, False
    m = re.search(r"conditions: (\[[^\]]*\])", block, re.S)
    if not m:
        return block, False
    new = "[" + ", ".join(js(c) for c in conds) + "]"
    if m.group(1) == new:
        return block, False
    return block[: m.start(1)] + new + block[m.end(1) :], True


def replace_ui(block: str, ui: list[str]) -> tuple[str, bool]:
    if not ui:
        return block, False
    ui_lit = "[" + ", ".join(js(u) for u in ui) + "]"
    m = re.search(r"ui: (\[[^\]]*\])", block, re.S)
    if m:
        if m.group(1) == ui_lit:
            return block, False
        return block[: m.start(1)] + ui_lit + block[m.end(1) :], True
    m2 = re.search(r"components: \{\s*\}", block)
    if m2:
        rep = "components: {\n      ui: " + ui_lit + ",\n    }"
        return block[: m2.start()] + rep + block[m2.end() :], True
    m3 = re.search(r"components: \{", block)
    if m3:
        return (
            block[: m3.start()]
            + "components: {\n      ui: "
            + ui_lit
            + ","
            + block[m3.end() :],
            True,
        )
    return block, False


def split_nodes(ts: str) -> tuple[str, list[str], str]:
    m = re.search(r"const nodes: HowNode\[\] = \[\n", ts)
    if not m:
        raise ValueError("no nodes array")
    start = m.end()
    end = ts.find("\n];\n\nexport", start)
    if end < 0:
        end = ts.find("\n];\n", start)
    body = ts[start:end]
    nodes: list[str] = []
    depth = 0
    cur: list[str] = []
    i = 0
    while i < len(body):
        ch = body[i]
        cur.append(ch)
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                j = i + 1
                while j < len(body) and body[j] in ", \n":
                    j += 1
                nodes.append("".join(cur).rstrip().rstrip(","))
                cur = []
                i = j
                continue
        i += 1
    return ts[:start], nodes, ts[end:]


def sync_file(md_path: Path, ts_path: Path) -> dict:
    md = md_path.read_text(encoding="utf-8")
    ts = ts_path.read_text(encoding="utf-8")
    statement = extract_statement(md)
    root_when, root_conds = extract_root_meta(md)
    by_q = {norm(s["question"]): s for s in extract_sections(md)}
    prefix, nodes, suffix = split_nodes(ts)
    stats: dict = {"updated": 0, "unmatched": []}
    new_nodes: list[str] = []
    for node in nodes:
        nid_m = re.search(r'id: "([^"]+)"', node)
        assert nid_m
        nid = nid_m.group(1)
        changed = False
        if nid == "outcome" and statement:
            node, c = replace_string_field(node, "clarity", statement)
            changed |= c
            if root_when:
                node, c = replace_string_field(node, "when", root_when)
                changed |= c
            if root_conds:
                node, c = replace_conditions(node, root_conds)
                changed |= c
        else:
            qm = re.search(r'question: ("(?:\\.|[^"\\])*"|null)', node)
            if qm and qm.group(1) != "null":
                q = json.loads(qm.group(1))
                info = by_q.get(norm(q))
                if not info:
                    nq = norm(q)
                    for k, v in by_q.items():
                        if nq[:50] == k[:50] or nq in k or k in nq:
                            info = v
                            break
                if info:
                    node, c = replace_string_field(node, "clarity", info["clarity"])
                    changed |= c
                    if info["when"]:
                        if re.search(r"when:", node):
                            node, c = replace_string_field(node, "when", info["when"])
                            changed |= c
                        else:
                            node = re.sub(
                                r"(criteria: \{\n)",
                                r"\1      when: " + js(info["when"]) + ",\n",
                                node,
                                count=1,
                            )
                            changed = True
                    if info["conditions"]:
                        node, c = replace_conditions(node, info["conditions"])
                        changed |= c
                    if info["ui"] and ("isLeaf: true" in node or nid.startswith("leaf")):
                        node, c = replace_ui(node, info["ui"])
                        changed |= c
                else:
                    stats["unmatched"].append(q[:90])
        if changed:
            stats["updated"] += 1
        new_nodes.append(node)
    ts_path.write_text(prefix + ",\n".join(new_nodes) + ",\n" + suffix, encoding="utf-8")
    return stats


def main() -> None:
    total = 0
    for stem, ts_name in MAP.items():
        st = sync_file(HOW_DIR / f"{stem}.md", TS_DIR / ts_name)
        total += st["updated"]
        print(f"  {stem}: nodes_updated={st['updated']} unmatched={st['unmatched']}")
    print(f"How sync complete — {total} nodes updated")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
