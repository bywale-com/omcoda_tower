import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { ClientPhaseSnapshot } from "../data/clients";
import type { Tokens } from "./tokens";

type PhaseTooltipProps = {
  snapshot: ClientPhaseSnapshot;
  t: Tokens;
  isDark: boolean;
  onViewInActivity: () => void;
  children: ReactNode;
};

function phaseDotColor(snapshot: ClientPhaseSnapshot, t: Tokens): string {
  if (snapshot.phase === "opt-in") {
    return snapshot.status === "COMPLETE" ? t.accent : t.red;
  }
  return t.amber;
}

function phaseDotPulse(snapshot: ClientPhaseSnapshot): boolean {
  return snapshot.status === "ACTIVE";
}

export function PhaseTooltip({
  snapshot,
  t,
  isDark,
  onViewInActivity,
  children,
}: PhaseTooltipProps) {
  const [panelHover, setPanelHover] = useState(false);

  const shadow = isDark
    ? "0 10px 30px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)"
    : "0 10px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)";

  const footerBg = panelHover
    ? (isDark ? "rgba(74, 123, 247, 0.12)" : "rgba(74, 123, 247, 0.06)")
    : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)");

  const footerText = panelHover ? t.accent : t.textMuted;
  const footerIcon = panelHover ? t.accent : t.textDim;
  const metaLabel = `${snapshot.phaseLabel} · ${snapshot.status}`;
  const dotColor = phaseDotColor(snapshot, t);
  const dotPulse = phaseDotPulse(snapshot);

  return (
    <HoverCard.Root openDelay={150} closeDelay={200}>
      <HoverCard.Trigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setPanelHover(true)}
          onMouseLeave={() => setPanelHover(false)}
          className="phase-tooltip-content"
          style={{
            width: 240,
            background: t.bgPrimary,
            border: `1px solid ${isDark ? t.border : "rgba(0,0,0,0.08)"}`,
            borderRadius: 12,
            boxShadow: shadow,
            zIndex: 9999,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            padding: 0,
          }}
        >
          <div style={{ animation: "phaseTooltipIn 150ms ease-out" }}>
          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "14px 14px 10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: dotColor,
                  flexShrink: 0,
                  animation: dotPulse ? "towerPulse 1.6s ease-in-out infinite" : undefined,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.textDim,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {metaLabel}
              </span>
            </div>
            {snapshot.nodeRef && (
              <span
                style={{
                  fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: t.textMuted,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  flexShrink: 0,
                  lineHeight: 1.2,
                }}
              >
                {snapshot.nodeRef}
              </span>
            )}
          </div>

          {/* Primary detail */}
          <div style={{ padding: "0 14px 16px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: t.textPrimary,
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {snapshot.headline}
            </div>
            {snapshot.detail && (
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  color: t.textMuted,
                }}
              >
                {snapshot.detail}
              </p>
            )}
          </div>

          {/* Action footer */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewInActivity();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "10px 14px",
              border: "none",
              borderTop: `1px solid ${t.borderLight}`,
              background: footerBg,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 120ms ease, color 120ms ease",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: footerText,
                transition: "color 120ms ease",
              }}
            >
              View in Activity
            </span>
            <ChevronRight
              size={14}
              color={footerIcon}
              strokeWidth={2.5}
              style={{
                flexShrink: 0,
                transition: "transform 120ms ease, color 120ms ease",
                transform: panelHover ? "translateX(2px)" : "translateX(0)",
              }}
            />
          </button>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
      <style>{`
        @keyframes phaseTooltipIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </HoverCard.Root>
  );
}
