import { useCallback, useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { wirePorts } from "../../wire";

export type WaitNoteGroup = {
  workflowId: string;
  waitNodeId: string;
  title: string;
  count: number;
};

function collapsedKey(note: WaitNoteGroup): string {
  return `tower.waitNote.collapsed.${note.workflowId}.${note.waitNodeId}`;
}

function isCollapsed(note: WaitNoteGroup): boolean {
  try {
    return sessionStorage.getItem(collapsedKey(note)) === "1";
  } catch {
    return false;
  }
}

function setCollapsed(note: WaitNoteGroup, value: boolean) {
  try {
    if (value) sessionStorage.setItem(collapsedKey(note), "1");
    else sessionStorage.removeItem(collapsedKey(note));
  } catch {
    /* session is enough */
  }
}

function noteId(note: WaitNoteGroup): string {
  return `${note.workflowId}:${note.waitNodeId}`;
}

/** N1 · N1b · N2 — title + count. Buttons are always Approve now · Approve later. */
export function WaitNoteOverlay({ approver }: { approver: "consultant" | "operator" }) {
  const [notes, setNotes] = useState<WaitNoteGroup[]>([]);
  const [laterFor, setLaterFor] = useState<string | null>(null);
  const [laterDate, setLaterDate] = useState("");
  const [laterTime, setLaterTime] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    void wirePorts.machineApi.listWaitOccupancy(approver).then((rows) => {
      setNotes(rows);
    }).catch(() => {
      setNotes([]);
    });
  }, [approver]);

  useEffect(() => {
    load();
    const tick = window.setInterval(load, 4000);
    const vis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [load]);

  const approveNow = async (note: WaitNoteGroup) => {
    const id = noteId(note);
    setBusy(id);
    try {
      await wirePorts.machineApi.approveWaitOccupancy({
        workflowId: note.workflowId,
        waitNodeId: note.waitNodeId,
        mode: "now",
        approver,
      });
      setCollapsed(note, false);
      setLaterFor(null);
      load();
    } catch {
      /* keep the note */
    } finally {
      setBusy(null);
    }
  };

  const scheduleLater = async (note: WaitNoteGroup, date: string, time: string) => {
    if (!date || !time) return;
    const id = noteId(note);
    const approveAt = new Date(`${date}T${time}`).toISOString();
    if (Number.isNaN(Date.parse(approveAt))) return;
    setBusy(id);
    try {
      await wirePorts.machineApi.approveWaitOccupancy({
        workflowId: note.workflowId,
        waitNodeId: note.waitNodeId,
        mode: "later",
        approveAt,
        approver,
      });
      setLaterFor(null);
      load();
    } catch {
      /* keep the nest */
    } finally {
      setBusy(null);
    }
  };

  if (!notes.length) return null;

  const openNotes = notes.filter((note) => !isCollapsed(note));
  const barNotes = notes.filter((note) => isCollapsed(note));

  return (
    <>
      {openNotes.map((note) => {
        const id = noteId(note);
        const nestOpen = laterFor === id;
        return (
          <div
            key={`n1-${id}`}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              background: "rgba(0,0,0,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 420,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                padding: "28px 28px 24px",
                position: "relative",
              }}
            >
              <button
                type="button"
                aria-label="Collapse note"
                onClick={() => {
                  setCollapsed(note, true);
                  setLaterFor(null);
                  setNotes((current) => [...current]);
                }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#8c8c8c",
                  fontSize: 16,
                }}
              >
                <CloseOutlined />
              </button>
              <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 20, paddingRight: 24 }}>
                {note.title}
              </Typography.Title>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "#1677ff", lineHeight: 1 }}>
                  {note.count}
                </span>
                <span style={{ marginLeft: 8, color: "#8c8c8c", fontSize: 16 }}>people</span>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", position: "relative" }}>
                <Button
                  type="primary"
                  size="large"
                  loading={busy === id}
                  onClick={() => void approveNow(note)}
                >
                  Approve now
                </Button>
                <div style={{ position: "relative" }}>
                  <Button
                    size="large"
                    onClick={() => {
                      setLaterFor(nestOpen ? null : id);
                      setLaterDate("");
                      setLaterTime("");
                    }}
                  >
                    Approve later
                  </Button>
                  {nestOpen ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 8,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "12px 12px 10px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 2,
                        minWidth: 220,
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Close schedule"
                        onClick={() => setLaterFor(null)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#8c8c8c",
                          fontSize: 11,
                          lineHeight: 1,
                        }}
                      >
                        <CloseOutlined />
                      </button>
                      <div style={{ display: "flex", gap: 8, paddingRight: 16 }}>
                        <input
                          type="date"
                          value={laterDate}
                          onChange={(event) => {
                            const next = event.target.value;
                            setLaterDate(next);
                            if (next && laterTime) void scheduleLater(note, next, laterTime);
                          }}
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            padding: "4px 8px",
                          }}
                        />
                        <input
                          type="time"
                          value={laterTime}
                          onChange={(event) => {
                            const next = event.target.value;
                            setLaterTime(next);
                            if (laterDate && next) void scheduleLater(note, laterDate, next);
                          }}
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            padding: "4px 8px",
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {barNotes.length ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1090,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {barNotes.map((note) => {
            const id = noteId(note);
            return (
              <div
                key={`n2-${id}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setCollapsed(note, false);
                  setNotes((current) => [...current]);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setCollapsed(note, false);
                    setNotes((current) => [...current]);
                  }
                }}
                style={{
                  background: "#1677ff",
                  color: "#fff",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <span>
                  {note.title} · {note.count}
                </span>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    void approveNow(note);
                  }}
                  loading={busy === id}
                  style={{ background: "#fff", color: "#1677ff", border: "none", fontWeight: 600 }}
                >
                  Approve now
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
