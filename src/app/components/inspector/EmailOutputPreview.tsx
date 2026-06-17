import { ArrowRight, Mail, MoreHorizontal } from "lucide-react";
import type { Tokens } from "../tokens";
import type { NodeOutputContent } from "./emailInspectorData";

type EmailOutputPreviewProps = {
  output: NodeOutputContent;
  t: Tokens;
  compact?: boolean;
};

function parseRecipient(to: string): { name: string; email: string } {
  const match = to.match(/^(.+?)\s*<(.+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: to, email: to };
}

function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<(.+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: from, email: from };
}

export function EmailOutputPreview({ output, t, compact = false }: EmailOutputPreviewProps) {
  const sender = parseSender(output.from);
  const recipient = parseRecipient(output.to);
  const bodyPad = compact ? 14 : 18;
  const progress = output.progress;

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        overflow: "hidden",
        background: "#111111",
      }}
    >
      {output.watermark && (
        <div
          style={{
            padding: "6px 12px",
            borderBottom: `1px dashed ${t.borderLight}`,
            color: t.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: "#0a0a0a",
          }}
        >
          {output.watermark}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: "#161616",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: t.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Mail size={12} color={t.accent} strokeWidth={2} />
        </div>
        <span style={{ flex: 1, fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sender.email}
        </span>
        <MoreHorizontal size={14} color={t.textDim} strokeWidth={1.75} />
      </div>

      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: "#141414",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: t.amber,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          T
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{sender.name}</div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{sender.email}</div>
        </div>
      </div>

      <div style={{ background: "#f8f8f8", color: "#1a1a1a", padding: bodyPad }}>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>
          {output.subject}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: compact ? 12 : 16 }}>
          To: {recipient.name} &lt;{recipient.email}&gt;
        </div>

        {output.headline ? (
          <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, marginBottom: 6 }}>{output.headline}</div>
        ) : null}
        <div style={{ fontSize: compact ? 12 : 13, color: "#374151", lineHeight: 1.55, marginBottom: compact ? 12 : 16 }}>
          {output.body}
        </div>

        {progress && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: compact ? 12 : 16,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>Application progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.amber }}>{progress.percent}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden", marginBottom: 10 }}>
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: "100%",
                  background: t.amber,
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
              {progress.steps.map((step) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6b7280" }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: step.done ? t.success : "#d1d5db",
                      flexShrink: 0,
                    }}
                  />
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {output.ctaLabel && (
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: compact ? "10px 14px" : "12px 16px",
            borderRadius: 6,
            border: "none",
            background: t.amber,
            color: "#fff",
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            cursor: "default",
          }}
        >
          {output.ctaLabel}
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
        )}

        <div style={{ marginTop: compact ? 12 : 16, fontSize: 10, color: "#9ca3af", lineHeight: 1.5, textAlign: "center" }}>
          Questions? Reply to this email or contact{" "}
          <span style={{ color: t.amber }}>support@tower.app</span>
        </div>
      </div>
    </div>
  );
}
