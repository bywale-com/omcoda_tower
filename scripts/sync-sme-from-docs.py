#!/usr/bin/env python3
"""Parse docs/sme Pass2 + PM implementation into theory/sme seat TS modules."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PASS2_DIR = ROOT / "docs" / "sme" / "pass2"
IMPL_DIR = ROOT / "docs" / "sme" / "implementation"
OUT_DIR = ROOT / "src" / "app" / "register" / "theory" / "sme"
SEATS_DIR = OUT_DIR / "seats"

SEAT_DEFS = [
    {
        "id": "immigration-pathway-eligibility",
        "file": "01-immigration-pathway-eligibility",
        "label": "Immigration pathway / service-eligibility ops",
        "domain": (
            "Canadian immigration pathway & service-eligibility operations "
            "(Express Entry / CEC / FSW / FST / PNP-shaped matrix; CRS/draw/category posture; "
            "what firms sell vs what a form may ask)."
        ),
        "whyExists": (
            "Tower ships house-authored evaluation packs that assert service eligibility, "
            "Analysis narratives, gap/ops unlocks, and self-reportable vs document-dependent splits — "
            "Founder/PM/CTO do not own how pathway/service-eligibility work is done well."
        ),
    },
    {
        "id": "ircc-reference-data",
        "file": "02-ircc-reference-data",
        "label": "IRCC reference-data currency",
        "domain": (
            "Maintaining Canadian immigration public-reference criteria as versioned data "
            "(categories, trades, cutoffs, provincial identifiers, draw-shaped constants)."
        ),
        "whyExists": (
            "Eligibility change from law/public-reference must move as versioned data without code deploy; "
            "residual is what must stay current, from which sources, at what freshness, and how publish "
            "interacts with live firm evaluations."
        ),
    },
    {
        "id": "canadian-privacy-casl",
        "file": "03-canadian-privacy-casl",
        "label": "Canadian privacy / CASL / SMS & email consent",
        "domain": (
            "Canadian privacy + CASL (and SMS/telecom commercial-message) consent for firm→client outreach "
            "and for Om Coda agent→consultant first text on ALG."
        ),
        "whyExists": (
            "Consent is SME-critical and not closed: firm DB authorization ≠ end-client consent; "
            "residual is what regimes require for CEMs, SMS, silence, proof, and the agent’s first text."
        ),
    },
    {
        "id": "consultancy-desk-ops",
        "file": "04-consultancy-desk-ops",
        "label": "Immigration consultancy desk operations",
        "domain": (
            "How Canadian immigration consultancies actually operate the desk — license/reputation risk, "
            "what “working the book under my license” means, meeting/brief practice, refusal of unethical outreach."
        ),
        "whyExists": (
            "Consultants authorize outreach under license and take meetings from an always-on engine they do not configure; "
            "residual is desk practice — inhabit signals, live brief contents, halt semantics, reputation risk."
        ),
    },
    {
        "id": "platform-ads-meta-trust",
        "file": "05-platform-ads-meta-trust",
        "label": "Platform ads / Meta policy & feed trust",
        "domain": (
            "Meta (FB/IG) ads practice for professional B2B acquisition — policy/review survival, "
            "in-feed one-tap capture craft, and outsized-but-true claim trust (anti-scam perception)."
        ),
        "whyExists": (
            "ALG Approach must survive platform review and consultant disbelief without persuasion theater; "
            "residual is how Meta policy and skeptical professionals actually behave."
        ),
    },
    {
        "id": "payments-escrow",
        "file": "06-payments-escrow",
        "label": "Payments / escrow (firm↔Om Coda)",
        "domain": (
            "Contingent-cost / escrow commercial mechanics between firm and Om Coda "
            "(not immigrant settlement funds; not money-transmitter of client funds)."
        ),
        "whyExists": (
            "Activation’s money finish line is escrow with undefined release terms (KU #1); "
            "residual is how contingent/escrow doors are structured, released, and overseen in B2B practice."
        ),
    },
    {
        "id": "consultancy-crm-book-connect",
        "file": "07-consultancy-crm-book-connect",
        "label": "Consultancy CRM / book-connection",
        "domain": (
            "How immigration consultancies hold and export contact books; what “database authorization” means "
            "across practice stacks (CRM OAuth, CSV/export, assisted import)."
        ),
        "whyExists": (
            "Database authorization is a hard activation input with undefined stack meanings (KU #2/#7); "
            "residual is real consultancy data-connection patterns that yield a sequence-ready book."
        ),
    },
]

ITEM_HEADER_RE = re.compile(
    r"^###\s+([a-z]+-\d+)(?:\s+[—\-].*)?\s*$",
    re.MULTILINE,
)
FIELD_RE = re.compile(
    r"^\*\*(Question|Thesis gap|Solution|References|Handoff|implementationProblem|implementation|implementationAdds|implementationPlant|Solution echo):\*\*\s*",
    re.MULTILINE,
)
URL_RE = re.compile(r"https?://[^\s\)\]>,;]+")
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
SKIP_FROM_INDEX_RE = re.compile(
    r"\|\s*\d+\s+[^|]+\|\s*\[[^\]]+\]\([^)]+\)\s*\|\s*\d+\s*\|\s*([^|]+)\|",
)


def js_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def parse_skip_list() -> set[str]:
    text = (IMPL_DIR / "00-INDEX.md").read_text(encoding="utf-8")
    skipped: set[str] = set()
    for match in SKIP_FROM_INDEX_RE.finditer(text):
        cell = match.group(1).strip()
        for item_id in re.findall(r"[a-z]+-\d+", cell):
            skipped.add(item_id)
    return skipped


def split_items(md: str) -> list[tuple[str, str]]:
    matches = list(ITEM_HEADER_RE.finditer(md))
    items: list[tuple[str, str]] = []
    for i, match in enumerate(matches):
        item_id = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        # Stop at trailing "## " sections (coverage maps, handoff summaries)
        body = md[start:end]
        trail = re.search(r"\n##\s+", body)
        if trail:
            body = body[: trail.start()]
        items.append((item_id, body.strip()))
    return items


def field_map(body: str) -> dict[str, str]:
    matches = list(FIELD_RE.finditer(body))
    fields: dict[str, str] = {}
    for i, match in enumerate(matches):
        key = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        value = body[start:end].strip()
        # Drop trailing horizontal rules / italics-only footnotes already handled later
        value = re.sub(r"\n---\s*$", "", value).strip()
        fields[key] = value
    return fields


def strip_solution_backticks(solution: str) -> str:
    text = solution.strip()
    # Collapse `mechanism` so that `purpose` → mechanism so that purpose
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text.strip()


def parse_reference_line(line: str) -> dict[str, str] | None:
    line = line.strip()
    if not line:
        return None
    line = re.sub(r"^[-*]\s+", "", line)
    line = line.strip()
    if not line:
        return None

    md_links = list(MD_LINK_RE.finditer(line))
    if md_links and (line.startswith("[") or len(md_links) >= 1 and not line.startswith("http")):
        # Prefer first markdown link as primary ref; if multiple on one bullet, emit each
        refs = []
        for m in md_links:
            refs.append({"title": m.group(1).strip(), "url": m.group(2).strip().rstrip(".,);")})
        # If there is non-link prose with no links only, fall through
        if refs:
            return refs[0] if len(refs) == 1 else refs  # type: ignore[return-value]

    urls = URL_RE.findall(line)
    if urls:
        url = urls[0].rstrip(".,);")
        title = line
        # Common pattern: Title — Source — URL
        before = re.split(r"\s+[—\-]\s+" + re.escape(url), line, maxsplit=1)[0]
        before = before.strip(" —-\t")
        if before:
            title = before
        else:
            # Bare URL bullet — drop trailing parenthetical notes from title
            title = url
        # Strip trailing italic notes like *(practice watch)*
        title = re.sub(r"\s*\*\([^)]*\)\*\s*$", "", title).strip()
        title = re.sub(r"\s*\([^)]*\)\s*$", "", title).strip() or url
        return {"title": title, "url": url}

    # No URL — keep title-only reference
    title = re.sub(r"\s*\*\([^)]*\)\*\s*$", "", line).strip()
    if title:
        return {"title": title, "url": ""}
    return None


def _looks_like_citation(text: str) -> bool:
    t = text.strip()
    if len(t) < 8:
        return False
    if t.startswith("(") or t.startswith("“") or t.startswith('"') or t.startswith("'"):
        return False
    if t.lower().startswith("needs verification"):
        return False
    # Parenthetical annotation fragments
    if re.fullmatch(r"[\w\s/\-]+", t) and len(t) < 40 and "§" not in t:
        # allow short Seed/World-ish without § if prefixed below
        pass
    return bool(
        re.search(
            r"\b(Seed|World|How|Personas|KU|Assump|IRCC|CASL|Meta|CICC|CRTC|FinCEN|Stripe|HubSpot|VisaFlo|Officio|Canada\.ca|Directive)\b",
            t,
            re.I,
        )
        or "§" in t
        or t.startswith("http")
        or len(t) >= 24
    )


def parse_references(raw: str) -> list[dict[str, str]]:
    if not raw:
        return []
    refs: list[dict[str, str]] = []

    lines = [ln for ln in raw.splitlines() if ln.strip()]
    bullet_lines = [ln for ln in lines if re.match(r"^\s*[-*]\s+", ln)]

    if bullet_lines:
        for ln in bullet_lines:
            parsed = parse_reference_line(ln)
            if isinstance(parsed, list):
                refs.extend(parsed)
            elif parsed:
                refs.append(parsed)
        return refs

    # Prose references: preserve order of markdown links and semicolon clauses.
    # Strip trailing parenthetical notes attached to links: ](url) (note)
    prose = re.sub(
        r"(\[[^\]]+\]\(https?://[^)]+\))\s*\([^)]*\)",
        r"\1",
        raw,
    )
    prose = re.split(r"\bNEEDS VERIFICATION\b", prose, maxsplit=1)[0].strip()

    pos = 0
    for m in MD_LINK_RE.finditer(prose):
        before = prose[pos : m.start()]
        for part in before.split(";"):
            part = part.strip(" ;.\n\t")
            part = re.sub(r"^\s*\([^)]*\)\s*", "", part).strip()
            part = re.sub(r"\s*\([^)]*\)\s*$", "", part).strip()
            if not part:
                continue
            urls = URL_RE.findall(part)
            if urls:
                url = urls[0].rstrip(".,);")
                title = part.replace(url, "").strip(" —-\t")
                refs.append({"title": title or url, "url": url})
            elif _looks_like_citation(part):
                refs.append({"title": part, "url": ""})
        refs.append(
            {
                "title": m.group(1).strip(),
                "url": m.group(2).strip().rstrip(".,);"),
            }
        )
        pos = m.end()

    after = prose[pos:]
    for part in after.split(";"):
        part = part.strip(" ;.\n\t")
        part = re.sub(r"^\s*\([^)]*\)\s*", "", part).strip()
        part = re.sub(r"\s*\([^)]*\)\s*$", "", part).strip()
        if not part:
            continue
        urls = URL_RE.findall(part)
        if urls:
            url = urls[0].rstrip(".,);")
            title = part.replace(url, "").strip(" —-\t")
            refs.append({"title": title or url, "url": url})
        elif _looks_like_citation(part):
            refs.append({"title": part, "url": ""})
    return refs


def parse_adds(raw: str) -> list[str]:
    text = raw.strip()
    if not text:
        return []
    # Prefer a JSON-ish array anywhere in the field (handles trailing notes / plant lines)
    bracket = re.search(r"\[[^\[\]]*\]", text)
    if bracket:
        candidate = bracket.group(0)
        try:
            arr = json.loads(candidate.replace("'", '"'))
            if isinstance(arr, list):
                return [str(x).strip() for x in arr if str(x).strip()]
        except json.JSONDecodeError:
            inner = candidate.strip("[]")
            return [p.strip().strip("\"'`") for p in inner.split(",") if p.strip().strip("\"'`")]

    # Bare backtick wrap without brackets
    text = text.strip("`").strip()
    # `tag` · `tag` or tag · tag
    parts = re.split(r"\s*[·•|,]\s*", text)
    adds: list[str] = []
    for part in parts:
        tag = part.strip().strip("`").strip()
        if tag and "implementationPlant" not in tag:
            adds.append(tag)
    return adds


def clean_implementation(raw: str) -> str:
    text = raw.strip()
    # Drop trailing Existing/New inventory notes
    text = re.sub(r"\n\*?Existing:.*$", "", text, flags=re.DOTALL).strip()
    text = text.strip("*").strip()
    return text


def is_skipped_impl(body: str, fields: dict[str, str]) -> bool:
    if "implementationProblem" in fields and "implementation" in fields:
        return False
    head = body[:400]
    if re.search(r"\bSKIPPED\b|\bSkipped\b", head):
        return True
    if "NEEDS VERIFICATION" in head and "implementationProblem" not in fields:
        return True
    return "implementation" not in fields


def mentions_needs_verification(pass_body: str, fields: dict[str, str]) -> bool:
    blob = "\n".join(
        [
            pass_body,
            fields.get("Handoff", ""),
            fields.get("References", ""),
            fields.get("Solution", ""),
            fields.get("Question", ""),
            fields.get("Thesis gap", ""),
        ]
    )
    return "NEEDS VERIFICATION" in blob


def emit_seat_ts(seat: dict, items: list[dict]) -> str:
    lines: list[str] = [
        'import type { SmeSeat } from "../../types";',
        "",
        "/** Auto-generated by scripts/sync-sme-from-docs.py — do not edit by hand. */",
        f"export const seat: SmeSeat = {{",
        f"  id: {js_str(seat['id'])},",
        f"  label: {js_str(seat['label'])},",
        f"  domain: {js_str(seat['domain'])},",
        f"  whyExists: {js_str(seat['whyExists'])},",
        "  items: [",
    ]
    for item in items:
        lines.append("    {")
        lines.append(f"      id: {js_str(item['id'])},")
        lines.append(f"      consideration: {js_str(item['consideration'])},")
        lines.append(f"      thesisGap: {js_str(item['thesisGap'])},")
        lines.append(f"      solution: {js_str(item['solution'])},")
        lines.append("      references: [")
        for ref in item["references"]:
            lines.append(
                f"        {{ title: {js_str(ref['title'])}, url: {js_str(ref['url'])} }},"
            )
        lines.append("      ],")
        if "implementationProblem" in item:
            lines.append(f"      implementationProblem: {js_str(item['implementationProblem'])},")
            lines.append(f"      implementation: {js_str(item['implementation'])},")
            adds = item.get("implementationAdds") or []
            lines.append(
                "      implementationAdds: ["
                + ", ".join(js_str(a) for a in adds)
                + "],"
            )
            lines.append('      implementationPlant: "not_done",')
        lines.append(f"      status: {js_str(item['status'])},")
        lines.append("    },")
    lines.append("  ],")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


def emit_index(seat_files: list[str]) -> str:
    imports = []
    names = []
    for i, fname in enumerate(seat_files, start=1):
        alias = f"seat{i:02d}"
        imports.append(f'import {{ seat as {alias} }} from "./seats/{fname}";')
        names.append(alias)
    return "\n".join(
        [
            'import type { SmeSeat } from "../types";',
            *imports,
            "",
            "/** SME seats — Pass2 considerations + PM implementation (paper). */",
            "export const SME_SEATS: SmeSeat[] = [",
            *[f"  {n}," for n in names],
            "];",
            "",
            "export function getSmeSeat(seatId: string): SmeSeat | undefined {",
            "  return SME_SEATS.find((seat) => seat.id === seatId);",
            "}",
            "",
            "export function getSmeItem(seatId: string, itemId: string) {",
            "  const seat = getSmeSeat(seatId);",
            "  return seat?.items.find((item) => item.id === itemId);",
            "}",
            "",
        ]
    )


def emit_root_export() -> str:
    return "\n".join(
        [
            'import { SME_SEATS as PRACTICE_SME_SEATS, getSmeItem as getPracticeSmeItem, getSmeSeat as getPracticeSmeSeat } from "./sme/index";',
            'import { CAPABILITY_SME_SEATS, getCapabilitySmeItem, getCapabilitySmeSeat } from "./sme/capability";',
            "",
            "export {",
            "  CAPABILITY_SME_SEATS,",
            "  getCapabilitySmeItem,",
            "  getCapabilitySmeSeat,",
            "  getPracticeSmeItem,",
            "  getPracticeSmeSeat,",
            "  PRACTICE_SME_SEATS,",
            "};",
            "",
            "export const SME_SEATS = [...PRACTICE_SME_SEATS, ...CAPABILITY_SME_SEATS];",
            "",
            "export function getSmeSeat(seatId: string) {",
            "  return getPracticeSmeSeat(seatId) ?? getCapabilitySmeSeat(seatId);",
            "}",
            "",
            "export function getSmeItem(seatId: string, itemId: string) {",
            "  return getPracticeSmeItem(seatId, itemId) ?? getCapabilitySmeItem(seatId, itemId);",
            "}",
            "",
        ]
    )


def main() -> None:
    skip_list = parse_skip_list()
    SEATS_DIR.mkdir(parents=True, exist_ok=True)

    summary: list[tuple[str, int, int, list[str]]] = []
    seat_files: list[str] = []

    for seat in SEAT_DEFS:
        pass2_path = PASS2_DIR / f"{seat['file']}.md"
        impl_path = IMPL_DIR / f"{seat['file']}.md"
        pass2_md = pass2_path.read_text(encoding="utf-8")
        impl_md = impl_path.read_text(encoding="utf-8") if impl_path.exists() else ""

        pass_items = {iid: body for iid, body in split_items(pass2_md)}
        impl_items = {iid: body for iid, body in split_items(impl_md)}

        # Preserve Pass2 order
        ordered_ids = [iid for iid, _ in split_items(pass2_md)]
        items_out: list[dict] = []
        skipped_here: list[str] = []
        with_impl = 0

        for item_id in ordered_ids:
            pbody = pass_items[item_id]
            pfields = field_map(pbody)
            ibody = impl_items.get(item_id, "")
            ifields = field_map(ibody) if ibody else {}

            consideration = pfields.get("Question", "").strip()
            # Question may be on same line after field; strip leading newlines already done
            thesis = pfields.get("Thesis gap", "").strip()
            solution = strip_solution_backticks(pfields.get("Solution", ""))
            references = parse_references(pfields.get("References", ""))

            in_skip = item_id in skip_list
            nv = in_skip or mentions_needs_verification(pbody, pfields)
            skipped_impl = (not ibody) or is_skipped_impl(ibody, ifields)

            item: dict = {
                "id": item_id,
                "consideration": consideration,
                "thesisGap": thesis,
                "solution": solution,
                "references": references,
            }

            if not skipped_impl and "implementation" in ifields:
                item["implementationProblem"] = ifields.get("implementationProblem", "").strip()
                item["implementation"] = clean_implementation(ifields["implementation"])
                item["implementationAdds"] = parse_adds(ifields.get("implementationAdds", ""))
                with_impl += 1
                item["status"] = "needs-verification" if nv else "verified"
            else:
                if in_skip or skipped_impl:
                    skipped_here.append(item_id)
                item["status"] = "needs-verification" if nv or skipped_impl else "partial"

            items_out.append(item)

        out_name = seat["file"]
        seat_files.append(out_name)
        (SEATS_DIR / f"{out_name}.ts").write_text(
            emit_seat_ts(seat, items_out), encoding="utf-8"
        )
        summary.append((seat["id"], len(items_out), with_impl, skipped_here))

    (OUT_DIR / "index.ts").write_text(emit_index(seat_files), encoding="utf-8")
    (ROOT / "src" / "app" / "register" / "theory" / "sme.ts").write_text(
        emit_root_export(),
        encoding="utf-8",
    )

    print("SME sync complete")
    print(f"Skip list from INDEX: {sorted(skip_list)}")
    total_items = 0
    total_impl = 0
    all_skipped: list[str] = []
    for seat_id, n, n_impl, skipped in summary:
        total_items += n
        total_impl += n_impl
        all_skipped.extend(skipped)
        print(f"  {seat_id}: {n} items, {n_impl} with implementation, skipped={skipped}")
    print(f"TOTAL: {total_items} items, {total_impl} with implementation, {len(all_skipped)} without")
    print(f"Skipped/NV without impl: {all_skipped}")


if __name__ == "__main__":
    main()
