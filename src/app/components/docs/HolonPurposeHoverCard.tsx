import type { ReactNode } from "react";
import type { Tokens } from "../tokens";
import type { HolonId } from "../../context/DocsHighlightContext";
import { useDocsHighlight } from "../../context/DocsHighlightContext";
import {
  getSurfacePurpose,
  parseSurfacePurposeContext,
  type SurfaceSeat,
} from "./surfacePurpose";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { DOCS_FONT_PROFILE } from "./treeTypography";

const SEAT_LABEL: Record<SurfaceSeat, string> = {
  consultant: "Consultant desk",
  operator: "Operator territory",
  shared: "Shared shell",
  unassigned: "Unassigned",
};

type HolonPurposeHoverCardProps = {
  holonId: HolonId;
  t: Tokens;
  focusHolon: (id: HolonId) => void;
  children: ReactNode;
};

export function HolonPurposeHoverCard({ holonId, t, focusHolon, children }: HolonPurposeHoverCardProps) {
  const entry = getSurfacePurpose(holonId);
  const { setHoveredComponentId } = useDocsHighlight();
  const purpose = entry?.purpose ?? "Purpose not registered yet — gap in the Console purpose pass.";
  const hasContext = Boolean(entry?.context);
  const contextParts = entry?.context ? parseSurfacePurposeContext(entry.context) : [];

  return (
    <HoverCard
      openDelay={120}
      closeDelay={80}
      onOpenChange={(open) => {
        if (open) setHoveredComponentId(holonId);
      }}
    >
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="z-50 w-80 max-w-[min(20rem,calc(100vw-2rem))] border p-0 shadow-md outline-none"
        style={{
          background: t.bgSecondary,
          borderColor: t.border,
          color: t.textPrimary,
          fontFamily: DOCS_FONT_PROFILE.fontFamily,
        }}
        onMouseEnter={() => setHoveredComponentId(holonId)}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: t.textDim,
            }}
          >
            Purpose
            {entry?.seat ? (
              <span
                style={{
                  fontWeight: 500,
                  marginLeft: 8,
                  color: t.textMuted,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                · {SEAT_LABEL[entry.seat]}
              </span>
            ) : null}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: t.textPrimary }}>{purpose}</p>

          {hasContext ? (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: t.textDim,
                  marginTop: 4,
                }}
              >
                Context
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: t.textMuted }}>
                {contextParts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i}>{part.text}</span>
                  ) : (
                    <button
                      key={`${part.holonId}-${i}`}
                      type="button"
                      title={`Focus ${part.label}`}
                      onMouseEnter={() => setHoveredComponentId(part.holonId)}
                      onMouseLeave={() => setHoveredComponentId(holonId)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredComponentId(part.holonId);
                        focusHolon(part.holonId);
                      }}
                      style={{
                        display: "inline",
                        padding: "0 3px",
                        margin: 0,
                        border: "none",
                        borderRadius: 2,
                        background: t.hoverBg,
                        color: t.accent,
                        fontWeight: 600,
                        fontSize: 13,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        lineHeight: 1.5,
                      }}
                    >
                      {part.label}
                    </button>
                  ),
                )}
              </div>
            </>
          ) : null}

          {!entry ? (
            <p style={{ margin: 0, fontSize: 11, color: t.textDim, lineHeight: 1.4 }}>
              Register this holon purpose in <code style={{ fontSize: 10 }}>surfacePurpose*.ts</code>.
            </p>
          ) : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
