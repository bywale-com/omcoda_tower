import { Check, CheckSquare, X } from "lucide-react";
import type { Tokens } from "../tokens";
import type { TaskStatus } from "../../data/tasks";

export type TaskTouchpointData = {
  taskId: string;
  id: string;
  label: string;
  dateLabel?: string;
  addedAt?: string;
  taskNote?: string;
  taskAssignee?: string;
  taskStatus: TaskStatus;
};

type TaskTouchpointPanelProps = {
  task: TaskTouchpointData;
  t: Tokens;
  onClose: () => void;
  onToggleComplete: () => void;
};

function DetailRow({ label, value, t }: { label: string; value: string; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: t.textPrimary, lineHeight: 1.45 }}>{value}</span>
    </div>
  );
}

export function TaskTouchpointPanel({ task, t, onClose, onToggleComplete }: TaskTouchpointPanelProps) {
  const isOpen = task.taskStatus === "open";
  const statusColor = isOpen ? t.red : t.success;

  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      border: `1px solid ${t.border}`,
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 10,
      background: t.bgPrimary,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "14px 14px 12px",
        borderBottom: `1px solid ${t.borderLight}`,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: isOpen ? `${t.red}18` : `${t.success}18`,
          border: `1px solid ${statusColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {isOpen
            ? <CheckSquare size={14} color={statusColor} strokeWidth={1.75} />
            : <Check size={14} color={statusColor} strokeWidth={2.5} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{task.label}</div>
          {task.dateLabel && (
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{task.dateLabel}</div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: t.textMuted,
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 999,
            background: isOpen ? `${t.red}18` : `${t.success}18`,
            color: statusColor,
            border: `1px solid ${statusColor}44`,
          }}>
            {isOpen ? "Open" : "Complete"}
          </span>
          {task.addedAt && (
            <span style={{
              fontSize: 10,
              color: t.textMuted,
              padding: "2px 8px",
              borderRadius: 999,
              border: `1px solid ${t.borderLight}`,
            }}>
              Added {task.addedAt}
            </span>
          )}
        </div>

        {task.taskNote && (
          <DetailRow label="Instruction" value={task.taskNote} t={t} />
        )}

        {task.taskAssignee && (
          <DetailRow label="Assignment" value={task.taskAssignee} t={t} />
        )}

        <DetailRow label="Source" value="Created by Tower · Rule R-04 escalation" t={t} />

        <button
          type="button"
          onClick={onToggleComplete}
          style={{
            marginTop: 4,
            padding: "8px 12px",
            borderRadius: 6,
            border: `1px solid ${statusColor}55`,
            background: isOpen ? `${t.red}12` : `${t.success}12`,
            color: statusColor,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {isOpen ? "Mark complete" : "Reopen task"}
        </button>
      </div>
    </div>
  );
}
