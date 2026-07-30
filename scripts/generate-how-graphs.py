#!/usr/bin/env python3
"""Parse docs/register/how/*.md into TypeScript HowGraph modules."""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOW_DIR = ROOT / "docs" / "register" / "how"
OUT_DIR = ROOT / "src" / "app" / "register" / "howAnalysis"

EPIC_ORDER = [
    "consultant-core",
    "consultant-governance",
    "consultant-access",
    "contact-consent",
    "contact-refresh",
    "contact-silence",
    "contact-book",
    "operator-acquisition",
    "operator-activation",
    "operator-reference-data",
    "operator-configuration-libraries",
    "operator-oversight",
    "operator-audit-trail",
    "operator-register-evolution",
    "operator-founder-controls",
    "operator-provision",
    "operator-commercial",
    "operator-firm-bind",
    "operator-book-readiness",
    "operator-firm-health",
    "operator-activation-state",
    "operator-support",
]

PARSE_FAILURES: list[str] = []


def kebab_to_camel(kebab: str) -> str:
    parts = kebab.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def kebab_to_const(kebab: str) -> str:
    return kebab.replace("-", "_").upper() + "_GRAPH"


def persona_for(graph_id: str) -> str:
    if graph_id.startswith("consultant-"):
        return "consultant"
    if graph_id.startswith("contact-"):
        return "engagement_contact"
    if graph_id.startswith("operator-"):
        return "operator"
    raise ValueError(f"Unknown persona for {graph_id}")


def ts_escape(s: str) -> str:
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
    )


def collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_statement(md: str) -> str:
    m = re.search(
        r"\*\*Statement\*\*\s*\n((?:>.*\n?)+)",
        md,
        re.MULTILINE,
    )
    if not m:
        PARSE_FAILURES.append("missing Statement blockquote")
        return ""
    lines = []
    for line in m.group(1).splitlines():
        line = line.strip()
        if line.startswith(">"):
            lines.append(line[1:].strip())
    return collapse_ws(" ".join(lines))


def parse_title_label(md: str) -> str:
    m = re.search(r"^#\s+(.+)$", md, re.MULTILINE)
    if not m:
        return "How"
    title = m.group(1).strip()
    if "—" in title:
        return title.split("—", 1)[1].strip()
    if "-" in title:
        # unlikely for H1
        return title
    return title


def split_conditions(raw: str) -> list[str]:
    raw = collapse_ws(raw)
    if not raw:
        return []
    parts = [p.strip() for p in raw.split(";") if p.strip()]
    return parts


@dataclass
class Section:
    kind: str  # root | depth | leaf
    heading: str
    code: str  # "", "1", "2a", "1.1", "2a.1"
    depth_num: int
    is_direct_leaf: bool
    body: str
    start_line: int


@dataclass
class NodeDraft:
    id: str
    parent_id: str | None
    kind: str
    depth: int
    question: str | None
    clarity: str
    when: str | None
    conditions: list[str]
    ui: list[str]
    is_leaf: bool = False
    sibling_index: int = 0


def extract_field(body: str, name: str) -> str | None:
    """Extract **Name:** value (possibly multi-line until blank or next ** or table)."""
    # Criteria — when uses special name
    pattern = rf"\*\*{re.escape(name)}:\*\*\s*(.*?)(?=\n\s*\n|\n\*\*[A-Za-z]|\n\| |\n### |\n## |\Z)"
    m = re.search(pattern, body, re.DOTALL)
    if not m:
        return None
    return collapse_ws(m.group(1))


def extract_ui_names(body: str) -> list[str]:
    # Find markdown table with UI header
    table_match = re.search(
        r"\|[^\n]*UI[^\n]*\|[^\n]*\n\|[-| :]+\|\n((?:\|[^\n]+\n?)*)",
        body,
    )
    if not table_match:
        return []
    rows = table_match.group(1).strip().splitlines()
    names: list[str] = []
    for row in rows:
        cells = [c.strip() for c in row.strip().strip("|").split("|")]
        if not cells or not cells[0]:
            continue
        names.append(cells[0])
    return names


def parse_sections(md: str) -> list[Section]:
    lines = md.splitlines()
    sections: list[Section] = []
    # Stop at Flow anchors / Explicit non-leaves
    stop_re = re.compile(r"^## (Flow anchors|Explicit non-leaves)")
    heading_re = re.compile(r"^(#{2,3})\s+(.+)$")

    i = 0
    while i < len(lines):
        line = lines[i]
        if stop_re.match(line):
            break
        hm = heading_re.match(line)
        if hm and hm.group(1) in ("##", "###"):
            level = len(hm.group(1))
            heading = hm.group(2).strip()
            start = i
            i += 1
            body_lines: list[str] = []
            while i < len(lines):
                nxt = lines[i]
                if stop_re.match(nxt):
                    break
                nm = heading_re.match(nxt)
                if nm:
                    nxt_level = len(nm.group(1))
                    nxt_heading = nm.group(2).strip()
                    # Same or shallower heading starts a new section
                    if nxt_level <= level:
                        break
                    # ### Leaf under ## Depth is its own section
                    if level == 2 and nxt_level == 3 and nxt_heading.startswith("Leaf"):
                        break
                body_lines.append(nxt)
                i += 1
            body = "\n".join(body_lines)

            if heading.startswith("Root"):
                sections.append(
                    Section("root", heading, "", 0, False, body, start + 1)
                )
            elif heading.startswith("Depth"):
                # Depth 1 — ... / Depth 2a — ...
                cm = re.match(r"Depth\s+(\d+[a-z]?)\b", heading)
                code = cm.group(1) if cm else "?"
                depth_num = int(re.match(r"(\d+)", code).group(1)) if re.match(r"(\d+)", code) else 1
                is_direct_leaf = bool(re.search(r"→\s*leaf\b", heading)) and not re.search(
                    r"→\s*leaves\b", heading
                )
                sections.append(
                    Section("depth", heading, code, depth_num, is_direct_leaf, body, start + 1)
                )
            elif heading.startswith("Leaf"):
                # Leaf 2a.1 — ... / Leaf 1.1 — ...
                cm = re.match(r"Leaf\s+([\d]+[a-z]?(?:\.[\d]+)?)\b", heading)
                code = cm.group(1) if cm else "?"
                parent_code = code.split(".")[0] if "." in code else code
                dm = re.match(r"(\d+)", parent_code)
                depth_num = (int(dm.group(1)) + 1) if dm else 2
                sections.append(
                    Section("leaf", heading, code, depth_num, True, body, start + 1)
                )
            # else ignore other ## headings before stop
            continue
        i += 1
    return sections


def parent_id_for_depth(code: str, depth_ids: dict[str, str]) -> str:
    """Resolve parent for a Depth Nx node."""
    # Depth 1 → outcome
    if re.fullmatch(r"1", code):
        return "outcome"
    # Depth 2 / 2a / 2b → depth-1
    dm = re.match(r"(\d+)([a-z]?)$", code)
    if not dm:
        return "outcome"
    n = int(dm.group(1))
    letter = dm.group(2)
    if n <= 1:
        return "outcome"
    # Prefer parent at n-1; if lettered siblings exist at n-1, use base n-1
    parent_base = str(n - 1)
    if parent_base in depth_ids:
        return depth_ids[parent_base]
    # Fallback: look for any depth at n-1
    for k, vid in depth_ids.items():
        if re.fullmatch(rf"{n-1}[a-z]?", k):
            return vid
    return "outcome"


def parent_id_for_leaf(code: str, depth_ids: dict[str, str]) -> str:
    # Leaf 2a.1 → depth-2a; Leaf 1.1 → depth-1
    if "." in code:
        parent_code = code.split(".", 1)[0]
    else:
        parent_code = code
    if parent_code in depth_ids:
        return depth_ids[parent_code]
    # try numeric only
    dm = re.match(r"(\d+)", parent_code)
    if dm and dm.group(1) in depth_ids:
        return depth_ids[dm.group(1)]
    return "outcome"


def build_nodes(md: str, statement: str) -> list[NodeDraft]:
    sections = parse_sections(md)
    nodes: list[NodeDraft] = []
    depth_ids: dict[str, str] = {}  # code → node id
    siblings_at_parent: dict[str, int] = {}

    def next_sibling(parent: str | None) -> int:
        key = parent or ""
        i = siblings_at_parent.get(key, 0)
        siblings_at_parent[key] = i + 1
        return i

    root = next((s for s in sections if s.kind == "root"), None)
    when = None
    conditions: list[str] = []
    if root:
        when_raw = extract_field(root.body, "Criteria — when")
        when = when_raw
        cond_raw = extract_field(root.body, "Conditions")
        conditions = split_conditions(cond_raw or "")
        clarity_raw = extract_field(root.body, "Clarity") or ""
        if re.search(r"\*?\(statement", clarity_raw, re.I) or not clarity_raw:
            clarity = statement
        else:
            clarity = clarity_raw
    else:
        PARSE_FAILURES.append("missing Root section")
        clarity = statement

    nodes.append(
        NodeDraft(
            id="outcome",
            parent_id=None,
            kind="outcome",
            depth=0,
            question=None,
            clarity=clarity,
            when=when,
            conditions=conditions,
            ui=[],
            sibling_index=0,
        )
    )

    for sec in sections:
        if sec.kind == "root":
            continue
        if sec.kind == "depth":
            node_id = f"depth-{sec.code}"
            if sec.code == "1":
                parent = "outcome"
            else:
                parent = parent_id_for_depth(sec.code, depth_ids)
            depth_ids[sec.code] = node_id

            q = extract_field(sec.body, "Q")
            clar = extract_field(sec.body, "Clarity") or ""
            when_raw = extract_field(sec.body, "Criteria — when")
            cond_raw = extract_field(sec.body, "Conditions")
            ui = extract_ui_names(sec.body)

            is_leaf = sec.is_direct_leaf
            kind = "leaf" if is_leaf else "answer"
            nodes.append(
                NodeDraft(
                    id=node_id,
                    parent_id=parent,
                    kind=kind,
                    depth=sec.depth_num,
                    question=q,
                    clarity=clar,
                    when=when_raw,
                    conditions=split_conditions(cond_raw or ""),
                    ui=ui,
                    is_leaf=is_leaf,
                    sibling_index=next_sibling(parent),
                )
            )
            if is_leaf and not ui:
                PARSE_FAILURES.append(f"{sec.heading}: direct leaf missing UI table")
            if not q:
                PARSE_FAILURES.append(f"{sec.heading}: missing Q")
            if not clar:
                PARSE_FAILURES.append(f"{sec.heading}: missing Clarity")

        elif sec.kind == "leaf":
            node_id = f"leaf-{sec.code}"
            parent = parent_id_for_leaf(sec.code, depth_ids)
            q = extract_field(sec.body, "Q")
            clar = extract_field(sec.body, "Clarity") or ""
            when_raw = extract_field(sec.body, "Criteria — when")
            cond_raw = extract_field(sec.body, "Conditions")
            ui = extract_ui_names(sec.body)
            # leaf depth = parent depth + 1
            parent_node = next((n for n in nodes if n.id == parent), None)
            depth = (parent_node.depth + 1) if parent_node else sec.depth_num
            nodes.append(
                NodeDraft(
                    id=node_id,
                    parent_id=parent,
                    kind="leaf",
                    depth=depth,
                    question=q,
                    clarity=clar,
                    when=when_raw,
                    conditions=split_conditions(cond_raw or ""),
                    ui=ui,
                    is_leaf=True,
                    sibling_index=next_sibling(parent),
                )
            )
            if not q:
                PARSE_FAILURES.append(f"{sec.heading}: missing Q")
            if not clar:
                PARSE_FAILURES.append(f"{sec.heading}: missing Clarity")
            if not ui:
                PARSE_FAILURES.append(f"{sec.heading}: missing UI table")

    return nodes


def assign_positions(nodes: list[NodeDraft]) -> None:
    # Group by depth for sibling indexing; use recorded sibling_index
    by_depth: dict[int, list[NodeDraft]] = {}
    for n in nodes:
        by_depth.setdefault(n.depth, []).append(n)
    for depth, group in by_depth.items():
        # sort by sibling order among same parent, then stable
        group.sort(key=lambda n: (n.parent_id or "", n.sibling_index, n.id))
        # Re-index globally at this depth for layout: x = 80 + i * 240
        for i, n in enumerate(group):
            n.sibling_index = i  # reuse as layout index


def emit_node_ts(n: NodeDraft) -> str:
    y = n.depth * 130
    x = 80 + n.sibling_index * 240
    lines: list[str] = []
    lines.append("  {")
    lines.append(f'    id: "{n.id}",')
    if n.parent_id is None:
        lines.append("    parentId: null,")
    else:
        lines.append(f'    parentId: "{n.parent_id}",')
    lines.append(f'    kind: "{n.kind}",')
    lines.append(f"    depth: {n.depth},")
    if n.question is None:
        lines.append("    question: null,")
    else:
        lines.append(f'    question: "{ts_escape(n.question)}",')
    clar = n.clarity
    if len(clar) > 90 or '"' in clar or "—" in clar:
        lines.append(f'    clarity: "{ts_escape(clar)}",')
    else:
        lines.append(f'    clarity: "{ts_escape(clar)}",')
    # criteria
    lines.append("    criteria: {")
    if n.when:
        lines.append(f'      when: "{ts_escape(n.when)}",')
    if n.conditions:
        lines.append("      conditions: [")
        for c in n.conditions:
            lines.append(f'        "{ts_escape(c)}",')
        lines.append("      ],")
    else:
        lines.append("      conditions: [],")
    lines.append("    },")
    # components
    if n.ui:
        lines.append("    components: {")
        lines.append("      ui: [")
        for u in n.ui:
            lines.append(f'        "{ts_escape(u)}",')
        lines.append("      ],")
        lines.append("    },")
    else:
        lines.append("    components: {},")
    if n.is_leaf or n.kind == "leaf":
        lines.append("    isLeaf: true,")
    lines.append(f"    position: {{ x: {x}, y: {y} }},")
    lines.append("  }")
    return "\n".join(lines)


def emit_graph_file(graph_id: str, label: str, epic: int, nodes: list[NodeDraft]) -> str:
    const = kebab_to_const(graph_id)
    persona = persona_for(graph_id)
    node_blocks = ",\n".join(emit_node_ts(n) for n in nodes)
    return f'''import type {{ HowGraph, HowNode }} from "./types";

const nodes: HowNode[] = [
{node_blocks},
];

export const {const}: HowGraph = {{
  id: "{graph_id}",
  label: "{ts_escape(label)}",
  epicOrder: {epic},
  personaId: "{persona}",
  outcomeId: "{graph_id}",
  nodes,
}};
'''


def emit_helpers() -> str:
    return '''import type { HowGraph, HowNode } from "./types";

export function getHowNode(graph: HowGraph, nodeId: string): HowNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getHowNodeChildren(graph: HowGraph, nodeId: string): HowNode[] {
  return graph.nodes
    .filter((node) => node.parentId === nodeId)
    .sort((a, b) => a.position.x - b.position.x);
}
'''


def emit_registry(graph_ids: list[str]) -> str:
    imports = []
    consts = []
    for gid in graph_ids:
        camel = kebab_to_camel(gid)
        const = kebab_to_const(gid)
        imports.append(f'import {{ {const} }} from "./{camel}";')
        consts.append(const)
    imports_block = "\n".join(imports)
    list_block = ",\n  ".join(consts)
    return f'''import type {{ HowGraph }} from "./types";
{imports_block}

/** Epics sorted by epicOrder — universal left-to-right priority. */
export const HOW_GRAPHS: HowGraph[] = [
  {list_block},
].sort((a, b) => a.epicOrder - b.epicOrder);

export function getHowGraph(id: string): HowGraph | undefined {{
  return HOW_GRAPHS.find((graph) => graph.id === id);
}}
'''


def emit_index() -> str:
    return '''export type { HowComponents, HowCriteria, HowGraph, HowNode, HowNodeKind } from "./types";
export { HOW_ANSWER_DISPLAY_MAX, truncateHowAnswer } from "./types";
export { getHowNode, getHowNodeChildren } from "./helpers";
export { HOW_GRAPHS, getHowGraph } from "./registry";
export { buildHowGraph } from "./buildHowGraph";
'''


def main() -> int:
    global PARSE_FAILURES
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    created: list[str] = []
    all_failures: list[str] = []

    for epic, graph_id in enumerate(EPIC_ORDER, start=1):
        PARSE_FAILURES = []
        md_path = HOW_DIR / f"{graph_id}.md"
        if not md_path.exists():
            all_failures.append(f"{graph_id}: MD file missing")
            continue
        md = md_path.read_text(encoding="utf-8")
        statement = parse_statement(md)
        label = parse_title_label(md)
        nodes = build_nodes(md, statement)
        assign_positions(nodes)
        camel = kebab_to_camel(graph_id)
        out_path = OUT_DIR / f"{camel}.ts"
        out_path.write_text(emit_graph_file(graph_id, label, epic, nodes), encoding="utf-8")
        created.append(graph_id)
        for f in PARSE_FAILURES:
            all_failures.append(f"{graph_id}: {f}")
        print(f"wrote {out_path.relative_to(ROOT)} ({len(nodes)} nodes)")

    (OUT_DIR / "helpers.ts").write_text(emit_helpers(), encoding="utf-8")
    (OUT_DIR / "registry.ts").write_text(emit_registry(created), encoding="utf-8")
    (OUT_DIR / "index.ts").write_text(emit_index(), encoding="utf-8")
    print(f"wrote helpers.ts, registry.ts, index.ts")
    print(f"CREATED={len(created)}")
    if all_failures:
        print("PARSE_FAILURES:")
        for f in all_failures:
            print(f"  - {f}")
    else:
        print("PARSE_FAILURES: none")

    # Delete stale graphs
    for stale in ("towerCoreOutcome.ts", "consultantOnTower.ts"):
        p = OUT_DIR / stale
        if p.exists():
            p.unlink()
            print(f"deleted {stale}")

    return 0 if len(created) == 22 else 1


if __name__ == "__main__":
    sys.exit(main())
