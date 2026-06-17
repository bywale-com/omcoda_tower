/**
 * Archived — full nudge briefing popover (Q&A feed, live form, stop sequence).
 * Preserved for reuse in a different context. Not used on client tree rows.
 */
import * as HoverCard from "@radix-ui/react-hover-card";
import type { ReactNode } from "react";
import type { NudgeBriefing } from "../../data/clients";
import type { Tokens } from "../tokens";

type NudgePopoverProps = {
  briefing: NudgeBriefing;
  t: Tokens;
  isDark: boolean;
  children: ReactNode;
};

type TagProps = {
  label: string;
  urgency: "teal" | "amber";
  t: Tokens;
};

function TriggerTag({ label, urgency, t }: TagProps) {
  const isTeal = urgency === "teal";
  return (
    <span
      style={{
        background: isTeal ? t.accentBg : t.amberBg,
        color: isTeal ? t.accent : t.amber,
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 999,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

type LiveFormViewerProps = {
  question: string;
  inputValue: string;
  t: Tokens;
};

function LiveFormViewer({ question, inputValue, t }: LiveFormViewerProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: t.textDim,
          marginBottom: 6,
        }}
      >
        Live form view
      </div>
      <div
        style={{
          height: 120,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          background: t.liveViewerBg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 22,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "0 8px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgPrimary,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 6, height: 6, borderRadius: "50%", background: t.browserDot }}
            />
          ))}
        </div>
        <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: t.textPrimary, fontWeight: 400 }}>
            {question}
          </p>
          <div
            style={{
              border: `1.5px solid ${t.accent}`,
              borderRadius: 4,
              background: t.bgPrimary,
              padding: "5px 8px",
              fontSize: 11,
              color: t.textPrimary,
              display: "flex",
              alignItems: "center",
            }}
          >
            {inputValue}
            <span
              style={{
                display: "inline-block",
                width: 1,
                height: 12,
                background: t.accent,
                marginLeft: 1,
                animation: "towerBlink 1s step-end infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NudgePopover({ briefing, t, isDark, children }: NudgePopoverProps) {
  const visibleTags = briefing.triggerTags.slice(0, 2);
  const popoverShadow = isDark
    ? "0 8px 30px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.4)"
    : "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)";

  return (
    <HoverCard.Root openDelay={180} closeDelay={80}>
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
          style={{
            width: 280,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: popoverShadow,
            padding: "14px 16px",
            zIndex: 9999,
            fontWeight: 400,
            outline: "none",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {visibleTags.map((tag) => (
              <TriggerTag key={tag.label} label={tag.label} urgency={tag.urgency} t={t} />
            ))}
            {briefing.hiddenTagCount > 0 && (
              <span
                style={{
                  background: t.tagNeutralBg,
                  color: t.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 999,
                  lineHeight: 1,
                }}
              >
                +{briefing.hiddenTagCount}
              </span>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: briefing.nudgeTotal }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 999,
                    background: i < briefing.nudgeCurrent ? t.accent : t.borderLight,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>
              Nudge {briefing.nudgeCurrent} of {briefing.nudgeTotal}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <LiveFormViewer
              question={briefing.liveForm.question}
              inputValue={briefing.liveForm.inputValue}
              t={t}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              position: "relative",
              height: 140,
              flexShrink: 0,
            }}
          >
            <div style={{ height: "100%", overflowY: "auto", paddingRight: 2 }}>
              {briefing.qaFeed.map((entry, i) => (
                <div key={i} style={{ marginBottom: i < briefing.qaFeed.length - 1 ? 12 : 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      lineHeight: 1.45,
                      color: t.textMuted,
                      fontWeight: entry.isCurrent ? 600 : 400,
                    }}
                  >
                    Q: {entry.question}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      lineHeight: 1.45,
                      color: t.textPrimary,
                      marginTop: 3,
                    }}
                  >
                    <span style={{ color: t.accent, fontWeight: 500 }}>Clients: </span>
                    {entry.answer}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: `linear-gradient(to bottom, ${t.bgPrimary} 0%, transparent 100%)`,
                pointerEvents: "none",
              }}
            />
          </div>

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "8px 0",
              background: t.bgPrimary,
              border: `1px solid ${t.red}`,
              borderRadius: 8,
              color: t.red,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Stop sequence
          </button>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
