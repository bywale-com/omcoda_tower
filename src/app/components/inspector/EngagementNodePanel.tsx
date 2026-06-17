import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  CornerUpLeft,
  Eye,
  FileText,
  Keyboard,
  Mail,
  Maximize2,
  MessageSquare,
  MousePointerClick,
  PenLine,
  Send,
  Sparkles,
  WrapText,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ThoughtStep } from "../../data/journeyTree";
import type { Tokens } from "../tokens";
import { ClientMessagePanel } from "./ClientMessagePanel";
import { EmailOutputPreview } from "./EmailOutputPreview";
import { FormCaptureReplay } from "./FormCaptureReplay";
import { FormOutputPreview } from "./FormOutputPreview";
import type {
  FormCompositeTelemetry,
  NodeDecision,
  NodeFormCapture,
  NodeInspectorPayload,
  NodeInspectorTab,
  NodeTelemetryEvent,
  NodeThreadItem,
  NodeThreadKind,
} from "./emailInspectorData";
import { FormReplayViewer } from "./FormCaptureReplay";

export const ENGAGEMENT_NODE_PANEL_WIDTH = 420;

const TABS: { id: NodeInspectorTab; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "O" },
  { id: "metadata", label: "Metadata", hint: "M" },
];

const MILESTONE_ICONS: Record<string, LucideIcon> = {
  Triggered: Zap,
  Sent: Send,
  Delivered: Mail,
  Opened: Eye,
  Clicked: MousePointerClick,
  Started: PenLine,
  Submitted: Check,
};

function milestoneCircleStyle(done: boolean, t: Tokens) {
  if (done) {
    return {
      background: t.success,
      border: `2px solid ${t.success}`,
      iconColor: "#fff",
      boxShadow: "0 0 12px rgba(22, 163, 74, 0.35)",
    };
  }
  return {
    background: t.tagNeutralBg,
    border: `2px solid ${t.borderLight}`,
    iconColor: t.textDim,
    boxShadow: "none",
  };
}

function statusAccent(status: NodeInspectorPayload["status"], t: Tokens): string {
  switch (status) {
    case "complete":
    case "historical":
      return t.success;
    case "in_progress":
      return t.accent;
    case "armed":
      return t.textMuted;
  }
}

function shortTimestamp(ts: string): string {
  if (ts === "—") return "—";
  const parts = ts.split("·");
  return parts.length > 1 ? parts[parts.length - 1].trim() : ts;
}

function threadKindMeta(kind: NodeThreadKind, t: Tokens) {
  switch (kind) {
    case "reply":
      return { fill: t.accent, Icon: CornerUpLeft };
    case "followup":
    case "sent":
      return { fill: t.amber, Icon: Mail };
    case "opened":
      return { fill: t.success, Icon: Eye };
  }
}

function ThreadInitiatorLine({
  actor,
  target,
  t,
}: {
  actor: string;
  target: string;
  t: Tokens;
}) {
  return (
    <span style={{ fontSize: 12, color: t.textPrimary, minWidth: 0 }}>
      <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{actor}</span>
      <span style={{ color: t.textMuted }}> to </span>
      <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{target}</span>
    </span>
  );
}

function ThreadSignalIcons({ t }: { t: Tokens }) {
  const size = 18;
  const items = [
    { Icon: Mail, met: true },
    { Icon: Eye, met: true },
    { Icon: MousePointerClick, met: false },
    { Icon: CornerUpLeft, met: false },
  ];

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8 }}>
      {items.map(({ Icon, met }, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: met ? t.success : t.tagNeutralBg,
            color: met ? "#fff" : t.textDim,
            border: met ? "none" : `1px solid ${t.borderLight}`,
          }}
        >
          <Icon size={10} strokeWidth={2.25} color="currentColor" />
        </span>
      ))}
    </span>
  );
}

function HorizontalMilestoneRail({
  steps,
  t,
}: {
  steps: NodeTelemetryEvent[];
  t: Tokens;
}) {
  const green = t.success;

  return (
    <div style={{ padding: "2px 0 4px" }}>
      <div style={{ display: "flex", width: "100%" }}>
        {steps.map((step, i) => {
          const done = step.status === "complete";
          const Icon = MILESTONE_ICONS[step.label] ?? Mail;
          const circle = milestoneCircleStyle(done, t);
          const leftLine = i > 0;
          const rightLine = i < steps.length - 1;
          const leftGreen = leftLine && steps[i - 1].status === "complete" && done;
          const rightGreen = rightLine && done && steps[i + 1].status === "complete";

          return (
            <div
              key={`${step.label}-${i}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                minWidth: 0,
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 28, marginBottom: 10 }}>
                {leftLine && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: "50%",
                      top: 13,
                      height: 2,
                      background: leftGreen ? green : t.borderLight,
                    }}
                  />
                )}
                {rightLine && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      right: 0,
                      top: 13,
                      height: 2,
                      background: rightGreen ? green : t.borderLight,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: circle.background,
                    border: circle.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    boxShadow: circle.boxShadow,
                    zIndex: 1,
                  }}
                >
                  <Icon size={13} color={circle.iconColor} strokeWidth={2.25} />
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "0 4px", width: "100%" }}>
                <div style={{ fontSize: 11, color: t.textPrimary, fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 3, lineHeight: 1.3 }}>
                  {shortTimestamp(step.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CompositeRailStep = NodeTelemetryEvent | (FormCompositeTelemetry & { label: string });

function FormCoreTelemetryRail({
  triggered,
  composite,
  t,
}: {
  triggered: NodeTelemetryEvent;
  composite: FormCompositeTelemetry[];
  t: Tokens;
}) {
  const steps: CompositeRailStep[] = [triggered, ...composite];
  const green = t.success;

  return (
    <div style={{ padding: "2px 0 4px" }}>
      <div style={{ display: "flex", width: "100%" }}>
        {steps.map((step, i) => {
          const done = step.status === "complete";
          const Icon = MILESTONE_ICONS[step.label] ?? Mail;
          const circle = milestoneCircleStyle(done, t);
          const leftLine = i > 0;
          const rightLine = i < steps.length - 1;
          const leftGreen = leftLine && steps[i - 1].status === "complete" && done;
          const rightGreen = rightLine && done && steps[i + 1].status === "complete";
          const count = "count" in step ? step.count : undefined;
          const timestamps = "timestamps" in step ? step.timestamps : [step.timestamp];

          return (
            <div
              key={`${step.label}-${i}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                minWidth: 0,
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 28, marginBottom: 10 }}>
                {leftLine && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: "50%",
                      top: 13,
                      height: 2,
                      background: leftGreen ? green : t.borderLight,
                    }}
                  />
                )}
                {rightLine && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      right: 0,
                      top: 13,
                      height: 2,
                      background: rightGreen ? green : t.borderLight,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: circle.background,
                    border: circle.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    boxShadow: circle.boxShadow,
                    zIndex: 1,
                  }}
                >
                  <Icon size={13} color={circle.iconColor} strokeWidth={2.25} />
                </div>
                {count !== undefined && count > 1 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: "calc(50% - 20px)",
                      fontSize: 9,
                      fontWeight: 700,
                      color: t.textPrimary,
                      background: t.bgPrimary,
                      border: `1px solid ${t.borderLight}`,
                      borderRadius: 8,
                      padding: "0 4px",
                      lineHeight: "14px",
                      zIndex: 2,
                    }}
                  >
                    ×{count}
                  </span>
                )}
              </div>
              <div style={{ textAlign: "center", padding: "0 4px", width: "100%" }}>
                <div style={{ fontSize: 11, color: t.textPrimary, fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 3, lineHeight: 1.35 }}>
                  {timestamps.map((ts) => (
                    <div key={ts}>{shortTimestamp(ts)}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewSectionTitle({
  title,
  count,
  actions,
  t,
}: {
  title: string;
  count?: number;
  actions?: React.ReactNode;
  t: Tokens;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>{title}</span>
        {count !== undefined && count > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: t.textMuted,
              background: t.bgTertiary,
              border: `1px solid ${t.borderLight}`,
              borderRadius: 10,
              padding: "1px 7px",
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {actions}
    </div>
  );
}

function ThoughtStepLine({
  step,
  t,
  dimmed,
  revealed,
  onReveal,
}: {
  step: ThoughtStep;
  t: Tokens;
  dimmed: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div style={{ marginBottom: revealed ? 6 : 2 }}>
      <button
        type="button"
        onClick={onReveal}
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          width: "100%",
          padding: "2px 0",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
          Thought for {step.durationSec}s
        </span>
        <span style={{ fontSize: 10, color: t.textDim }}>|</span>
        <span
          style={{
            fontSize: 11,
            color: dimmed && !revealed ? t.textDim : t.textMuted,
            opacity: dimmed && !revealed ? 0.55 : 1,
          }}
        >
          {step.label}
        </span>
      </button>
      {revealed && (
        <p
          style={{
            margin: "4px 0 0",
            paddingLeft: 8,
            fontSize: 10,
            lineHeight: 1.45,
            color: t.textDim,
            borderLeft: `2px solid ${t.borderLight}`,
          }}
        >
          {step.rationale}
        </p>
      )}
    </div>
  );
}

function DecisionRow({
  decision,
  thoughtChain,
  t,
}: {
  decision: NodeDecision;
  thoughtChain: ThoughtStep[];
  t: Tokens;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [revealedThoughts, setRevealedThoughts] = useState<Set<string>>(new Set());
  const expandable = thoughtChain.length > 0;

  useEffect(() => {
    setOpen(false);
    setHovered(false);
    setRevealedThoughts(new Set());
  }, [decision.scheduledLabel, decision.at]);

  const toggleReveal = (stepId: string) => {
    setRevealedThoughts((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const showChevron = expandable && (open || hovered);

  const rowContent = (
    <>
      <Sparkles size={11} color={t.amber} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary, flexShrink: 0 }}>
        {decision.scheduledLabel}
      </span>
      {showChevron && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0, width: 14 }}>
          {open
            ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
            : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />}
        </span>
      )}
      <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0, marginLeft: "auto" }}>{decision.at}</span>
    </>
  );

  const rowStyle = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: 8,
    width: "100%",
    height: 26,
  };

  return (
    <div>
      {expandable ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            ...rowStyle,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {rowContent}
        </button>
      ) : (
        <div style={rowStyle}>{rowContent}</div>
      )}

      {open && expandable && (
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          {thoughtChain.map((step, i) => (
            <ThoughtStepLine
              key={step.id}
              step={step}
              t={t}
              dimmed={i > 0}
              revealed={revealedThoughts.has(step.id)}
              onReveal={() => toggleReveal(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CaptureInitiatorLine({ actor, formTitle, t }: { actor: string; formTitle: string; t: Tokens }) {
  return (
    <span style={{ fontSize: 12, color: t.textPrimary, minWidth: 0 }}>
      <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{actor}</span>
      <span style={{ color: t.textMuted }}> on </span>
      <span style={{ color: t.textMuted }}>{formTitle}</span>
    </span>
  );
}

function CaptureRow({
  capture,
  formTitle,
  formOutput,
  t,
  expanded,
  onToggle,
  isLast,
}: {
  capture: NodeFormCapture;
  formTitle: string;
  formOutput: Extract<NodeInspectorPayload, { channelType: "form" }>["output"];
  t: Tokens;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div style={{ position: "relative", paddingBottom: isLast ? 0 : 18, paddingLeft: 28 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: t.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <Keyboard size={11} color="#fff" strokeWidth={2.25} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <CaptureInitiatorLine actor={capture.actor} formTitle={formTitle} t={t} />
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0, whiteSpace: "nowrap" }}>{capture.at}</span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${t.borderLight}`,
          borderRadius: 8,
          background: expanded ? t.hoverBg : t.bgSecondary,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, lineHeight: 1.35 }}>
          {capture.fieldLabel}
        </div>
        <div
          style={{
            fontSize: 11,
            color: t.textMuted,
            lineHeight: 1.45,
            marginTop: 6,
            fontFamily: "ui-monospace, Consolas, monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {capture.snippet}
        </div>
        <div style={{ fontSize: 10, color: t.textDim, marginTop: 6 }}>
          {capture.durationSec}s typing session
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          <FormCaptureReplay capture={capture} formOutput={formOutput} t={t} />
        </div>
      )}
    </div>
  );
}

function FormVisitsBlock({
  captures,
  formTitle,
  formOutput,
  t,
}: {
  captures: NodeFormCapture[];
  formTitle: string;
  formOutput: Extract<NodeInspectorPayload, { channelType: "form" }>["output"];
  t: Tokens;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedId(null);
  }, [captures]);

  if (captures.length === 0) {
    return (
      <div
        style={{
          padding: "14px 12px",
          border: `1px solid ${t.borderLight}`,
          borderRadius: 8,
          color: t.textDim,
          fontSize: 11,
        }}
      >
        No form visits recorded.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 2 }}>
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 14,
          bottom: 14,
          width: 1,
          background: t.borderLight,
        }}
      />
      {captures.map((capture, i) => (
        <CaptureRow
          key={capture.id}
          capture={capture}
          formTitle={formTitle}
          formOutput={formOutput}
          t={t}
          isLast={i === captures.length - 1}
          expanded={expandedId === capture.id}
          onToggle={() => setExpandedId((id) => (id === capture.id ? null : capture.id))}
        />
      ))}
    </div>
  );
}

function ThreadRow({
  thread,
  t,
  expanded,
  onToggle,
  isLast,
}: {
  thread: NodeThreadItem;
  t: Tokens;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const meta = threadKindMeta(thread.kind, t);
  const ThreadIcon = meta.Icon;

  return (
    <div style={{ position: "relative", paddingBottom: isLast ? 0 : 18, paddingLeft: 28 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: meta.fill,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <ThreadIcon size={11} color="#fff" strokeWidth={2.25} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <ThreadInitiatorLine actor={thread.actor} target={thread.target} t={t} />
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0, whiteSpace: "nowrap" }}>{thread.at}</span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${t.borderLight}`,
          borderRadius: 8,
          background: expanded ? t.hoverBg : t.bgSecondary,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, lineHeight: 1.35 }}>
          {thread.subject}
        </div>
        <div
          style={{
            fontSize: 11,
            color: t.textMuted,
            lineHeight: 1.45,
            marginTop: 6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {thread.snippet}
        </div>
        {!expanded && thread.kind === "followup" && (
          <ThreadSignalIcons t={t} />
        )}
      </button>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          <EmailOutputPreview output={thread.output} t={t} compact />
        </div>
      )}
    </div>
  );
}

function ThreadsBlock({
  threads,
  t,
}: {
  threads: NodeInspectorPayload["threads"];
  t: Tokens;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedId(null);
  }, [threads]);

  if (threads.length === 0) {
    return (
      <div
        style={{
          padding: "14px 12px",
          border: `1px solid ${t.borderLight}`,
          borderRadius: 8,
          color: t.textDim,
          fontSize: 11,
        }}
      >
        No replies attached.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 2 }}>
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 14,
          bottom: 14,
          width: 1,
          background: t.borderLight,
        }}
      />
      {threads.map((thread, i) => (
        <ThreadRow
          key={thread.id}
          thread={thread}
          t={t}
          isLast={i === threads.length - 1}
          expanded={expandedId === thread.id}
          onToggle={() => setExpandedId((id) => (id === thread.id ? null : thread.id))}
        />
      ))}
    </div>
  );
}

type EngagementNodePanelProps = {
  data: NodeInspectorPayload;
  t: Tokens;
  onClose: () => void;
  onNavigate?: (touchpointId: string) => void;
};

export function EngagementNodePanel({ data, t, onClose, onNavigate }: EngagementNodePanelProps) {
  const [tab, setTab] = useState<NodeInspectorTab>("overview");
  const accent = statusAccent(data.status, t);
  const HeaderIcon =
    data.channelType === "form" ? FileText : data.channelType === "sms" ? MessageSquare : Mail;
  const isCoreForm = data.channelType === "form" && data.formScope === "core";
  const isSessionForm = data.channelType === "form" && data.formScope === "session";
  const isText = data.channelType === "sms";
  const showThreads = data.channelType === "email" || data.threads.length > 0;
  const previewTitle = isSessionForm ? "Replay" : "Preview";
  const showPreviewActions = !isSessionForm;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setTab("overview");
  }, [data.touchpointId]);

  const iconActions = (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[WrapText, Copy, Maximize2].map((Icon, i) => (
        <button
          key={i}
          type="button"
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: t.textDim,
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          <Icon size={13} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: ENGAGEMENT_NODE_PANEL_WIDTH,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        borderLeft: `1px solid ${t.border}`,
        animation: "engagementNodeSlideIn 0.22s ease-out",
      }}
    >
      <style>{`
        @keyframes engagementNodeSlideIn {
          from { transform: translateX(100%); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{ padding: "12px 14px 0", borderBottom: `1px solid ${t.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <HeaderIcon size={14} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: t.textPrimary }}>
            {data.nodeTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            {onNavigate && (data.navigation?.prev || data.navigation?.next) && (
              <>
                <button
                  type="button"
                  disabled={!data.navigation?.prev}
                  onClick={() => data.navigation?.prev && onNavigate(data.navigation.prev.touchpointId)}
                  title={data.navigation?.prev?.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    background: "transparent",
                    border: "none",
                    color: data.navigation?.prev ? t.textMuted : t.textDim,
                    opacity: data.navigation?.prev ? 1 : 0.3,
                    cursor: data.navigation?.prev ? "pointer" : "default",
                    borderRadius: 4,
                  }}
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  disabled={!data.navigation?.next}
                  onClick={() => data.navigation?.next && onNavigate(data.navigation.next.touchpointId)}
                  title={data.navigation?.next?.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    background: "transparent",
                    border: "none",
                    color: data.navigation?.next ? t.textMuted : t.textDim,
                    opacity: data.navigation?.next ? 1 : 0.3,
                    cursor: data.navigation?.next ? "pointer" : "default",
                    borderRadius: 4,
                  }}
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                color: t.textDim,
                cursor: "pointer",
                fontSize: 11,
                padding: "4px 6px",
              }}
            >
              <span>Esc</span>
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: -1 }}>
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  color: active ? t.textPrimary : t.textMuted,
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent",
                  padding: "8px 10px",
                  cursor: "pointer",
                }}
              >
                {item.label}
                <span
                  style={{
                    fontSize: 9,
                    color: t.textDim,
                    border: `1px solid ${t.borderLight}`,
                    borderRadius: 3,
                    padding: "1px 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px" }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>{data.statusLabel}</span>
              </div>
              {isSessionForm && data.visitOrigin && (
                <div style={{ marginTop: -8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: t.textDim }}>
                    {data.visitOrigin === "funnel" ? "Email link" : "Prior email"}
                    {data.sourceEmailLabel ? ` · ${data.sourceEmailLabel}` : ""}
                  </span>
                </div>
              )}
              {isCoreForm && data.compositeTelemetry && data.compositeTelemetry.length > 0 ? (
                <FormCoreTelemetryRail
                  triggered={data.telemetry[0]}
                  composite={data.compositeTelemetry}
                  t={t}
                />
              ) : (
                <HorizontalMilestoneRail steps={data.telemetry} t={t} />
              )}
            </div>

            {data.decision && (
              <div>
                <OverviewSectionTitle title="Decision" t={t} />
                <DecisionRow
                  decision={data.decision}
                  thoughtChain={data.rules?.thoughtChain ?? []}
                  t={t}
                />
              </div>
            )}

            <div>
              <OverviewSectionTitle title={previewTitle} actions={showPreviewActions ? iconActions : undefined} t={t} />
              {isSessionForm && data.sessionReplay ? (
                <FormReplayViewer
                  events={data.sessionReplay.events}
                  durationSec={data.sessionReplay.durationSec}
                  formOutput={data.output}
                  t={t}
                  headerLabel="Session replay"
                  replayKey={data.touchpointId}
                />
              ) : isText ? (
                <ClientMessagePanel
                  thread={data.messageThread}
                  t={t}
                  panelKey={data.touchpointId}
                  channelFilter="sms"
                />
              ) : data.channelType === "form" ? (
                <FormOutputPreview output={data.output} t={t} />
              ) : (
                <EmailOutputPreview output={data.output} t={t} />
              )}
            </div>

            {isCoreForm && (
              <div>
                <OverviewSectionTitle title="Form visits" count={data.captures.length} t={t} />
                <FormVisitsBlock
                  captures={data.captures}
                  formTitle={data.output.title}
                  formOutput={data.output}
                  t={t}
                />
              </div>
            )}

            {showThreads && (
              <div>
                <OverviewSectionTitle title="Threads" count={data.threads.length} t={t} />
                <ThreadsBlock threads={data.threads} t={t} />
              </div>
            )}
          </div>
        )}

        {tab === "metadata" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Sequence", data.sequenceId],
              ["Touchpoint", data.touchpointId],
              ["Channel", data.channelLabel],
              ["Status", data.statusLabel],
              ...(data.channelType === "form" && data.formScope === "session" && data.visitOrigin
                ? [["Entry", data.visitOrigin === "funnel" ? "Email link" : "Prior email"] as const]
                : []),
              ...(data.channelType === "form" && data.sourceEmailLabel
                ? [["Source email", data.sourceEmailLabel] as const]
                : []),
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 600, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: t.textPrimary, wordBreak: "break-all" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** @deprecated use EngagementNodePanel */
export const EmailInspectorPanel = EngagementNodePanel;
export const EMAIL_INSPECTOR_PANEL_WIDTH = ENGAGEMENT_NODE_PANEL_WIDTH;
