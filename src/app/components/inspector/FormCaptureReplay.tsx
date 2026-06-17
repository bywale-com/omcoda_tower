import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Tokens } from "../tokens";
import type { FormTypingEvent, NodeFormCapture, NodeFormOutputContent } from "./emailInspectorData";

type FormReplayViewerProps = {
  events: FormTypingEvent[];
  durationSec: number;
  formOutput: NodeFormOutputContent;
  t: Tokens;
  headerLabel?: string;
  replayKey?: string;
  highlightField?: string;
};

export function FormReplayViewer({
  events,
  durationSec,
  formOutput,
  t,
  headerLabel = "Typing replay",
  replayKey,
  highlightField,
}: FormReplayViewerProps) {
  const [playing, setPlaying] = useState(true);
  const [atMs, setAtMs] = useState(0);

  const maxMs = events[events.length - 1]?.atMs ?? 0;
  const resetKey = replayKey ?? events.map((event) => `${event.atMs}:${event.value}`).join("|");

  useEffect(() => {
    setPlaying(true);
    setAtMs(0);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    if (atMs >= maxMs) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setAtMs((ms) => Math.min(ms + 60, maxMs)), 60);
    return () => window.clearTimeout(timer);
  }, [playing, atMs, maxMs]);

  const valuesByField = useMemo(() => {
    const values: Record<string, string> = {};
    for (const field of formOutput.fields) {
      if (field.value) values[field.label] = field.value;
    }
    for (const event of events) {
      if (event.atMs <= atMs) values[event.fieldLabel] = event.value;
    }
    return values;
  }, [atMs, events, formOutput.fields]);

  const activeField =
    [...events].reverse().find((event) => event.atMs <= atMs)?.fieldLabel ?? highlightField ?? events[0]?.fieldLabel;

  const progress = maxMs > 0 ? (atMs / maxMs) * 100 : 100;

  return (
    <div
      style={{
        border: `1px solid ${t.borderLight}`,
        borderRadius: 8,
        overflow: "hidden",
        background: "#111111",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 10px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: "#161616",
        }}
      >
        <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>{headerLabel}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: t.textDim }}>
            {Math.round(atMs / 1000)}s / {durationSec}s
          </span>
          <button
            type="button"
            onClick={() => {
              if (atMs >= maxMs) setAtMs(0);
              setPlaying((p) => !p);
            }}
            style={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              border: `1px solid ${t.borderLight}`,
              background: "transparent",
              color: t.textMuted,
              cursor: "pointer",
            }}
          >
            {playing ? <Pause size={11} strokeWidth={2} /> : <Play size={11} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div style={{ height: 3, background: t.borderLight }}>
        <div style={{ width: `${progress}%`, height: "100%", background: t.accent, transition: "width 60ms linear" }} />
      </div>

      <div style={{ background: "#f8f8f8", color: "#1a1a1a", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{formOutput.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {formOutput.fields.map((field) => {
            const value = valuesByField[field.label] ?? "";
            const isActive = activeField === field.label && playing;
            const isTarget = highlightField === field.label || events.some((event) => event.fieldLabel === field.label);

            return (
              <div key={field.label}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{field.label}</div>
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: `2px solid ${isActive ? t.accent : isTarget && atMs > 0 ? t.amber : "#e5e7eb"}`,
                    background: isActive ? "rgba(74, 123, 247, 0.06)" : "#fff",
                    fontSize: 12,
                    color: value ? "#1a1a1a" : "#9ca3af",
                    minHeight: 34,
                    display: "flex",
                    alignItems: "center",
                    fontFamily: isTarget ? "ui-monospace, Consolas, monospace" : "inherit",
                  }}
                >
                  {value || field.placeholder || "—"}
                  {isActive && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 14,
                        marginLeft: 1,
                        background: t.accent,
                        animation: "captureCursorBlink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes captureCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

type FormCaptureReplayProps = {
  capture: NodeFormCapture;
  formOutput: NodeFormOutputContent;
  t: Tokens;
};

export function FormCaptureReplay({ capture, formOutput, t }: FormCaptureReplayProps) {
  return (
    <FormReplayViewer
      events={capture.events}
      durationSec={capture.durationSec}
      formOutput={formOutput}
      t={t}
      replayKey={capture.id}
      highlightField={capture.fieldLabel}
    />
  );
}
