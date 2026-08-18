import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BankOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { Empty, Input, Modal, Select, Space, Typography } from "antd";
import {
  TRIGGER_SELECT_EVENTS,
  triggerSelectEvent,
  type TriggerSelectId,
} from "../../../../data/automationTriggerSelect";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { loadPickerDirectory } from "./pickerDirectory";

type BookRow = {
  id: string;
  name: string | null;
  email: string | null;
  firmId?: string | null;
  firmName?: string | null;
};

type Option = { value: string; label: string };

const EVENT_ICON: Record<TriggerSelectId, { node: ReactNode; color: string }> = {
  fact_writebacks: { node: <FileTextOutlined />, color: "#1677ff" },
  campaign_failure: { node: <CloseCircleOutlined />, color: "#ff4d4f" },
  "consent_records.opt_out": { node: <UserDeleteOutlined />, color: "#722ed1" },
  ct_firms: { node: <BankOutlined />, color: "#52c41a" },
  "audit.completed": { node: <CheckCircleOutlined />, color: "#52c41a" },
  contact_import: { node: <CloudUploadOutlined />, color: "#1677ff" },
  "contact.created": { node: <UserAddOutlined />, color: "#13c2c2" },
  "reference.pack": { node: <InboxOutlined />, color: "#fa8c16" },
};

export function TriggerSelectModal({
  open,
  data,
  book,
  firms: firmOptions,
  instanceOptions,
  onClose,
  onPatch,
}: {
  open: boolean;
  data: WorkflowNodeData;
  book: BookRow[];
  firms?: Option[];
  instanceOptions: Option[];
  onClose: () => void;
  onPatch: (patch: Partial<WorkflowNodeData>) => void;
}) {
  const [tab, setTab] = useState<"event" | "schedule">(data.triggerKind === "schedule" ? "schedule" : "event");
  const [query, setQuery] = useState("");
  const [loadedFirms, setLoadedFirms] = useState<Option[]>([]);
  const [loadedBook, setLoadedBook] = useState<BookRow[]>([]);
  const spec = triggerSelectEvent(undefined, data.triggerEvent);
  const selected = spec.id;
  const grain = data.grain === "local" ? "local" : "global";
  const firmLayer = data.localFirmSelect === "select" ? "select" : "every";
  const instanceLayer = data.localInstanceSelect === "select" ? "select" : "every";

  useEffect(() => {
    if (!open) return;
    void loadPickerDirectory()
      .then(({ contacts, firms: next }) => {
        setLoadedFirms(next);
        setLoadedBook(contacts);
      })
      .catch(() => undefined);
  }, [open]);

  const firms = useMemo<Option[]>(() => {
    const map = new Map<string, string>();
    for (const row of [...(firmOptions ?? []), ...loadedFirms]) {
      map.set(row.value, row.label);
    }
    for (const row of [...book, ...loadedBook]) {
      const id = row.firmId?.trim();
      if (!id) continue;
      if (!map.has(id)) map.set(id, row.firmName?.trim() || id);
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [firmOptions, loadedFirms, book, loadedBook]);

  const contacts = useMemo(
    () =>
      [...book, ...loadedBook].filter((row) =>
        data.localFirmId ? row.firmId === data.localFirmId : true,
      ),
    [book, loadedBook, data.localFirmId],
  );

  const hay = query.trim().toLowerCase();
  const events = TRIGGER_SELECT_EVENTS.filter((row) => !hay || row.label.toLowerCase().includes(hay));

  const pickEvent = (id: TriggerSelectId) => {
    const next = triggerSelectEvent(id);
    const keepLocal = data.grain === "local" && !next.silent && next.layers.length > 0;
    onPatch({
      triggerKind: "event",
      triggerEvent: next.eventName ?? undefined,
      label: next.label,
      configured: true,
      grain: keepLocal ? "local" : "global",
      localFirmId: undefined,
      localContactIds: [],
      localRef: undefined,
      localFirmSelect: "every",
      localInstanceSelect: "every",
      enrollmentHint: next.eventName ? `Fires on ${next.eventName}` : next.label,
    });
  };

  const hasFirm = spec.layers.some((row) => row.kind === "firm");
  const hasContact = spec.layers.some((row) => row.kind === "contact");
  const instance = spec.layers.find((row) => row.kind === "instance");
  const showLocal = grain === "local" && !spec.silent && spec.layers.length > 0;
  const showFirmBox = showLocal && hasFirm && firmLayer === "select";
  const showContact = showLocal && hasContact && firmLayer === "select" && Boolean(data.localFirmId);
  const showInstance = showLocal && instance && (!hasFirm || (firmLayer === "select" && Boolean(data.localFirmId)));

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={440} title="Trigger">
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #f0f0f0", marginBottom: 12 }}>
        {(["event", "schedule"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              if (key === "schedule") {
                onPatch({
                  triggerKind: "schedule",
                  configured: Boolean(data.scheduleCron || data.scheduleSummary),
                  label: data.scheduleSummary || "Schedule",
                });
              } else {
                onPatch({ triggerKind: "event", configured: Boolean(data.triggerEvent) || spec.id === "reference.pack" });
              }
            }}
            style={{
              border: "none",
              background: "transparent",
              padding: "8px 0",
              cursor: "pointer",
              fontWeight: 600,
              color: tab === key ? "#1677ff" : "#8c8c8c",
              borderBottom: tab === key ? "2px solid #1677ff" : "2px solid transparent",
            }}
          >
            {key === "event" ? "Event" : "Schedule"}
          </button>
        ))}
      </div>
      {tab === "schedule" ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="0 * * * *"
            value={data.scheduleCron ?? data.scheduleSummary ?? ""}
            onChange={(event) => {
              const scheduleCron = event.target.value;
              onPatch({
                triggerKind: "schedule",
                scheduleCron,
                scheduleSummary: scheduleCron,
                configured: Boolean(scheduleCron.trim()),
                label: scheduleCron || "Schedule",
              });
            }}
          />
        </Space>
      ) : (
        <>
          <Input.Search
            placeholder="Search events"
            value={query}
            allowClear
            onChange={(event) => setQuery(event.target.value)}
            style={{ marginBottom: 12 }}
          />
          {events.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />
          ) : (
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              {events.map((row) => {
                const icon = EVENT_ICON[row.id];
                const on = row.id === selected;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => pickEvent(row.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: 8,
                      background: on ? "#e6f4ff" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: icon.color, fontSize: 16 }}>{icon.node}</span>
                    <Typography.Text style={{ flex: 1 }}>{row.label}</Typography.Text>
                    {on ? <Typography.Text style={{ color: "#1677ff" }}>✓</Typography.Text> : null}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Grain
            </Typography.Text>
            <Select
              value={grain}
              style={{ width: "100%" }}
              options={[
                { value: "global", label: "Global" },
                { value: "local", label: "Local" },
              ]}
              onChange={(value: "global" | "local") =>
                onPatch({
                  grain: value,
                  localFirmId: value === "global" ? undefined : data.localFirmId,
                  localContactIds: value === "global" ? [] : data.localContactIds,
                  localRef: value === "global" ? undefined : data.localRef,
                  localFirmSelect: value === "global" ? "every" : data.localFirmSelect,
                  localInstanceSelect: value === "global" ? "every" : data.localInstanceSelect,
                })
              }
            />
          </div>
          {showLocal && hasFirm ? (
            <div style={{ marginTop: 12 }}>
              <Select
                value={firmLayer}
                style={{ width: "100%" }}
                options={[
                  { value: "every", label: "Every firm" },
                  { value: "select", label: "Select firm" },
                ]}
                onChange={(value: "every" | "select") =>
                  onPatch({
                    grain: "local",
                    localFirmSelect: value,
                    localFirmId: value === "every" ? undefined : data.localFirmId,
                    localContactIds: [],
                    localRef: spec.id === "ct_firms" && value === "every" ? undefined : data.localRef,
                  })
                }
              />
            </div>
          ) : null}
          {showFirmBox ? (
            <div style={{ marginTop: 12 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Firm
              </Typography.Text>
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                style={{ width: "100%" }}
                placeholder="Firm"
                value={data.localFirmId || (spec.id === "ct_firms" ? data.localRef : undefined)}
                options={firms}
                onChange={(value) =>
                  onPatch({
                    grain: "local",
                    localFirmSelect: "select",
                    localFirmId: value,
                    localContactIds: [],
                    localRef: spec.id === "ct_firms" ? value : data.localInstanceSelect === "select" ? data.localRef : undefined,
                  })
                }
              />
            </div>
          ) : null}
          {showContact ? (
            <div style={{ marginTop: 12 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Contact
              </Typography.Text>
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: "100%" }}
                placeholder="All contacts"
                value={data.localContactIds ?? []}
                options={contacts.map((row) => ({
                  value: row.id,
                  label: row.name || row.email || row.id,
                }))}
                onChange={(value) => onPatch({ grain: "local", localContactIds: value })}
              />
            </div>
          ) : null}
          {showInstance && instance && instance.kind === "instance" ? (
            <div style={{ marginTop: 12 }}>
              <Select
                value={instanceLayer}
                style={{ width: "100%" }}
                options={[
                  { value: "every", label: instance.everyLabel },
                  { value: "select", label: instance.selectLabel },
                ]}
                onChange={(value: "every" | "select") =>
                  onPatch({
                    grain: "local",
                    localInstanceSelect: value,
                    localRef: value === "every" ? undefined : data.localRef,
                  })
                }
              />
              {instanceLayer === "select" ? (
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder={instance.label}
                  value={data.localRef || undefined}
                  options={instanceOptions}
                  onChange={(value) =>
                    onPatch({ grain: "local", localInstanceSelect: "select", localRef: value })
                  }
                />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </Modal>
  );
}
