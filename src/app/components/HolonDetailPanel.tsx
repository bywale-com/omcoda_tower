import { X } from "lucide-react";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { useDocsHighlight } from "../context/DocsHighlightContext";
import { useHolonDetail } from "../context/HolonDetailContext";
import { useDocsRegistry } from "../context/DocsRegistryContext";
import { HolonBoundary } from "./docs/HolonBoundary";
import { getHolonDetailContent } from "./docs/holonDetailContent";
import type { HolonDetailLink, HolonDetailSection } from "./docs/holonDetailContent";
import { HolonTreeIcon } from "./docs/HolonTreeIcon";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { docsLabelStyle } from "./docs/treeTypography";
import { s } from "./docs/treeLayout";
import type { Tokens } from "./tokens";

const HEADER_LABEL_SIZE = 13;
const SECTION_TITLE_SIZE = 11;
const BODY_SIZE = 12;

type HolonDetailPanelProps = {
  width: number;
  t: Tokens;
};

function DetailLinkChip({
  link,
  onOpen,
  t,
}: {
  link: HolonDetailLink;
  onOpen: (id: string) => void;
  t: Tokens;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(link.id)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${t.borderLight}`,
        background: t.hoverBg,
        color: t.textPrimary,
        fontSize: s(10),
        fontWeight: 500,
        cursor: "pointer",
        lineHeight: 1.3,
      }}
    >
      {link.label}
    </button>
  );
}

function DetailSection({
  section,
  onOpenHolon,
  t,
}: {
  section: HolonDetailSection;
  onOpenHolon: (id: string) => void;
  t: Tokens;
}) {
  return (
    <section style={{ marginBottom: s(14) }}>
      <h3
        style={{
          ...docsLabelStyle(SECTION_TITLE_SIZE, t.textMuted),
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: `0 0 ${s(6)}px`,
        }}
      >
        {section.title}
      </h3>
      {section.paragraphs?.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          style={{
            margin: `0 0 ${s(8)}px`,
            fontSize: BODY_SIZE,
            lineHeight: 1.55,
            color: t.textPrimary,
          }}
        >
          {paragraph}
        </p>
      ))}
      {section.bullets && (
        <ul
          style={{
            margin: `0 0 ${s(8)}px`,
            paddingLeft: s(16),
            fontSize: BODY_SIZE,
            lineHeight: 1.55,
            color: t.textPrimary,
          }}
        >
          {section.bullets.map((item) => (
            <li key={item.slice(0, 48)} style={{ marginBottom: s(4) }}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.links && section.links.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: s(6), marginTop: s(4) }}>
          {section.links.map((link) => (
            <DetailLinkChip key={link.id} link={link} onOpen={onOpenHolon} t={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function HolonDetailBody({
  holonId,
  onOpenHolon,
  t,
}: {
  holonId: string;
  onOpenHolon: (id: string) => void;
  t: Tokens;
}) {
  const { holons } = useDocsRegistry();
  const content = getHolonDetailContent(holonId);
  const holon = holons.get(holonId);

  if (content) {
    return (
      <div style={{ padding: `${s(10)}px ${s(12)}px ${s(12)}px` }}>
        <p
          style={{
            margin: `0 0 ${s(14)}px`,
            fontSize: BODY_SIZE,
            lineHeight: 1.55,
            color: t.textPrimary,
          }}
        >
          {content.summary}
        </p>
        {content.sections.map((section) => (
          <DetailSection
            key={section.title}
            section={section}
            onOpenHolon={onOpenHolon}
            t={t}
          />
        ))}
      </div>
    );
  }

  const label = holon?.label ?? holonId;
  return (
    <div
      style={{
        padding: `${s(16)}px ${s(12)}px`,
        fontSize: BODY_SIZE,
        lineHeight: 1.55,
        color: t.textDim,
      }}
    >
      Detail content for <span style={{ color: t.textPrimary }}>{label}</span> is coming soon.
    </div>
  );
}

export function HolonDetailPanel({ width, t }: HolonDetailPanelProps) {
  const { detailHolonId, closeHolonDetail, openHolonDetail } = useHolonDetail();
  const { setHoveredComponentId } = useDocsHighlight();
  const { holons } = useDocsRegistry();

  if (!detailHolonId) return null;

  const content = getHolonDetailContent(detailHolonId);
  const holon = holons.get(detailHolonId);
  const label = content?.label ?? holon?.label ?? "Holon";
  const icon = content?.icon ?? holon?.icon;
  const lucideIcon = holon?.lucideIcon;

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        background: t.boardPanel,
        borderLeft: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <HolonBoundary
        id="holon-detail-header"
        label="Holon Detail Header"
        icon="document"
        order={SHELL_HOLON_ORDER["holon-detail-header"]}
        t={t}
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px 0 12px",
          borderBottom: `1px solid ${t.border}`,
          boxSizing: "border-box",
        }}
      >
        {(icon || lucideIcon) && (
          <HolonTreeIcon
            notionIcon={icon}
            lucideIcon={lucideIcon}
            size={14}
            color={t.textMuted}
          />
        )}
        <span
          style={{
            ...docsLabelStyle(HEADER_LABEL_SIZE, t.textPrimary, { ellipsis: true }),
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
        </span>
        <button
          type="button"
          title="Close detail panel"
          aria-label="Close detail panel"
          onClick={closeHolonDetail}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            padding: 0,
            border: "none",
            borderRadius: 4,
            background: "transparent",
            color: t.textMuted,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </HolonBoundary>

      <HolonBoundary
        id="holon-detail-body"
        label="Holon Detail Body"
        icon="list"
        order={SHELL_HOLON_ORDER["holon-detail-body"]}
        t={t}
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
        onMouseEnter={() => setHoveredComponentId(detailHolonId)}
        onMouseLeave={() => setHoveredComponentId(null)}
      >
        <HolonDetailBody
          holonId={detailHolonId}
          onOpenHolon={openHolonDetail}
          t={t}
        />
      </HolonBoundary>
    </div>
  );
}
