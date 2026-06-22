import { Eye, Mail, Monitor, RefreshCw, Smartphone } from "lucide-react";
import type { AgentStep } from "../../../../data/agentSteps";
import { AGENT_STEP_NODE_PATTERN_HOLONS } from "../../../docs/agentHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { cn } from "../../../ui/utils";
import type { Tokens } from "../../../tokens";
import {
  agentStepCompactLabel,
  agentStepFieldLabel,
  agentStepHintText,
  agentStepInputCompact,
  agentStepTextareaCompact,
} from "../stepNodeStyles";
import { AgentStepFrame } from "./AgentStepFrame";

type EmailStepNodeProps = {
  step: AgentStep;
  stepIndex: number;
  t: Tokens;
  selected: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: () => void;
  onChange: (patch: Partial<NonNullable<AgentStep["email"]>>) => void;
};

const panePadding = 10;
const emailFontSize = 12;

export function EmailStepNode({
  step,
  stepIndex,
  t,
  selected,
  collapsed,
  onToggleCollapse,
  onSelect,
  onChange,
}: EmailStepNodeProps) {
  const email = step.email ?? { subject: "", body: "", threadType: "new" as const };
  const patternTarget = useHolonPatternHighlight(
    AGENT_STEP_NODE_PATTERN_HOLONS.email.id,
    t.accent,
  );
  const { style: patternHighlightStyle, ...patternInspectProps } = patternTarget;

  return (
    <AgentStepFrame
      step={step}
      stepIndex={stepIndex}
      t={t}
      selected={selected}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onSelect={onSelect}
      icon={<Mail size={14} strokeWidth={2} color={t.accent} />}
      maxWidth={980}
      shellHighlight={patternHighlightStyle}
      shellInspectProps={patternInspectProps}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 460,
        }}
      >
        <div
          style={{
            padding: panePadding,
            borderRight: `1px solid ${t.border}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {(["Assisted", "Prompt", "Template"] as const).map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  "tower-chrome-menu-item rounded-sm px-1.5 py-0.5 outline-none",
                  index === 2 ? "hover:bg-accent hover:text-accent-foreground" : "cursor-default",
                )}
                style={{
                  fontSize: 10,
                  fontWeight: index === 2 ? 600 : 500,
                  color: index === 2 ? t.textPrimary : t.textMuted,
                  borderBottom: index === 2 ? `2px solid ${t.accent}` : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <label style={{ flex: 1, minWidth: 0, ...agentStepFieldLabel(t) }}>
              Subject
              <input
                type="text"
                value={email.subject}
                placeholder="Enter email subject"
                style={agentStepInputCompact(t)}
                onChange={(event) => onChange({ subject: event.target.value })}
                onClick={(event) => event.stopPropagation()}
              />
            </label>
            <label style={{ flexShrink: 0, width: 108, ...agentStepFieldLabel(t) }}>
              Type
              <select
                value={email.threadType}
                style={agentStepInputCompact(t)}
                onChange={(event) =>
                  onChange({ threadType: event.target.value as "new" | "reply" })
                }
                onClick={(event) => event.stopPropagation()}
              >
                <option value="new">New thread</option>
                <option value="reply">Reply</option>
              </select>
            </label>
          </div>

          <label style={{ ...agentStepFieldLabel(t), flex: 1, display: "flex", flexDirection: "column" }}>
            Body
            <textarea
              value={email.body}
              placeholder="Enter email body"
              style={{ ...agentStepTextareaCompact(t, 300), flex: 1 }}
              onChange={(event) => onChange({ body: event.target.value })}
              onClick={(event) => event.stopPropagation()}
            />
          </label>
        </div>

        <div
          style={{
            padding: panePadding,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span style={{ ...agentStepCompactLabel(t), color: t.textPrimary, fontWeight: 600 }}>
              Preview
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button
                type="button"
                title="Refresh preview"
                aria-label="Refresh preview"
                className={cn(
                  "tower-chrome-menu-item inline-flex h-6 w-6 items-center justify-center rounded-sm outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{ color: t.textMuted }}
              >
                <RefreshCw size={12} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Desktop preview"
                aria-label="Desktop preview"
                className={cn(
                  "tower-chrome-menu-item inline-flex h-6 w-6 items-center justify-center rounded-sm outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{ color: t.textPrimary, background: t.hoverBg }}
              >
                <Monitor size={12} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Mobile preview"
                aria-label="Mobile preview"
                className={cn(
                  "tower-chrome-menu-item inline-flex h-6 w-6 items-center justify-center rounded-sm outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{ color: t.textMuted }}
              >
                <Smartphone size={12} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Preview options"
                aria-label="Preview options"
                className={cn(
                  "tower-chrome-menu-item inline-flex h-6 w-6 items-center justify-center rounded-sm outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{ color: t.textMuted }}
              >
                <Eye size={12} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: 6,
              border: `1px solid ${t.accent}33`,
              background: t.accentBg,
              padding: 10,
              minHeight: 300,
              fontSize: emailFontSize,
            }}
          >
            <div style={{ ...agentStepHintText(t), fontSize: 10, marginBottom: 6 }}>
              To: Select contact
            </div>
            <div
              style={{
                fontSize: emailFontSize,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 8,
                lineHeight: 1.35,
              }}
            >
              Subject: {email.subject.trim() || "(Empty)"}
            </div>
            <div
              style={{
                fontSize: emailFontSize,
                color: t.textPrimary,
                lineHeight: 1.45,
                whiteSpace: "pre-wrap",
              }}
            >
              {email.body.trim() || "Enter email body to preview content here."}
            </div>
          </div>
        </div>
      </div>
    </AgentStepFrame>
  );
}
