import { ArrowRight, FileText, MoreHorizontal } from "lucide-react";
import type { Tokens } from "../tokens";
import type { NodeFormOutputContent } from "./emailInspectorData";

type FormOutputPreviewProps = {
  output: NodeFormOutputContent;
  t: Tokens;
  compact?: boolean;
};

export function FormOutputPreview({ output, t, compact = false }: FormOutputPreviewProps) {
  const bodyPad = compact ? 14 : 18;
  const progress = output.progress;

  return (
    <div
      style={{
        border: `1px solid ${t.borderLight}`,
        borderRadius: 10,
        overflow: "hidden",
        background: "#111111",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
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
          <FileText size={12} color={t.accent} strokeWidth={2} />
        </div>
        <span style={{ flex: 1, fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {output.url ?? "forms.tower.app"}
        </span>
        <MoreHorizontal size={14} color={t.textDim} strokeWidth={1.75} />
      </div>

      <div style={{ background: "#f8f8f8", color: "#1a1a1a", padding: bodyPad }}>
        <div style={{ fontSize: compact ? 15 : 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>
          {output.title}
        </div>
        {output.description && (
          <div style={{ fontSize: compact ? 11 : 12, color: "#6b7280", lineHeight: 1.5, marginBottom: compact ? 12 : 16 }}>
            {output.description}
          </div>
        )}

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
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>Completion</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.amber }}>{progress.percent}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${progress.percent}%`, height: "100%", background: t.amber, borderRadius: 3 }} />
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

        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 12, marginBottom: compact ? 12 : 16 }}>
          {output.fields.map((field) => (
            <div key={field.label}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>{field.label}</div>
              <div
                style={{
                  padding: "9px 11px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: field.filled === false ? "#fafafa" : "#fff",
                  fontSize: compact ? 12 : 13,
                  color: field.value ? "#1a1a1a" : "#9ca3af",
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {field.value ?? field.placeholder ?? "—"}
              </div>
            </div>
          ))}
        </div>

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
          {output.submitLabel}
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
