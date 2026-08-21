import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppstoreOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Radio, Select, Space, Tag, Typography } from "antd";
import { collectibleLabel } from "../../../../data/collectibleFields";
import {
  IN_APP_AFFORDANCES,
  inAppAffordance,
  inAppModules,
  type InAppAffordance,
  type InAppAffordanceId,
} from "../../../../data/inAppAffordances";
import { MODAL_SCROLL } from "../modalScroll";
import {
  ACTION_TYPE_DEFAULT_LABELS,
  WORKFLOW_AGENT_OPTIONS,
  type MappedChip,
  type WorkflowActionType,
  type WorkflowAgentRef,
  type WorkflowNodeData,
} from "../../../../data/automationWorkflows";
import { MappedSlot } from "./MappedSlot";

const SEQUENCE_RADIOS: { id: WorkflowAgentRef; classId: "optin" | "reengagement" | "reactivation"; label: string }[] = [
  { id: "tpl.optin_launch.v1", classId: "optin", label: "Opt-in" },
  { id: "tpl.reengagement.v1", classId: "reengagement", label: "Re-engagement" },
  { id: "tpl.reactivation.v1", classId: "reactivation", label: "Reactivation" },
];

function KindCard({
  selected,
  icon,
  title,
  body,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: 18,
        borderRadius: 8,
        border: selected ? "2px solid #1677ff" : "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
        flex: 1,
        minHeight: 140,
      }}
    >
      <Space direction="vertical" size={8}>
        <span style={{ fontSize: 20, color: selected ? "#1677ff" : "#8c8c8c" }}>{icon}</span>
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
          {body}
        </Typography.Paragraph>
      </Space>
    </button>
  );
}

export function ActionKindModal({
  open,
  onCancel,
  onPickAgents,
  onPickInApp,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  onCancel: () => void;
  onPickAgents: () => void;
  onPickInApp: () => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [kind, setKind] = useState<"agents" | "in_app">("agents");
  useEffect(() => {
    if (open) setKind("agents");
  }, [open]);

  const commit = () => (kind === "agents" ? onPickAgents() : onPickInApp());
  useEffect(() => {
    if (embed && open) onRegisterSave?.(commit);
  });

  const body = (
      <div style={{ display: "flex", gap: 12 }}>
        <KindCard
          selected={kind === "agents"}
          icon={<TeamOutlined />}
          title="Agents"
          body="Send people to accomplish a goal. Select an agent, or create the objective."
          onClick={() => setKind("agents")}
        />
        <KindCard
          selected={kind === "in_app"}
          icon={<AppstoreOutlined />}
          title="In the application"
          body="Press a write-button that already exists on a module."
          onClick={() => setKind("in_app")}
        />
      </div>
  );

  if (embed) return body;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      title={
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Action
          </Typography.Title>
          <Typography.Text type="secondary">Choose what this action does.</Typography.Text>
        </div>
      }
      width={640}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={commit}>
            Save
          </Button>
        </Space>
      }
    >
      {body}
    </Modal>
  );
}

function AssignCard({
  selected,
  title,
  subtext,
  badge,
  value,
  onSelectCard,
  onSelectClass,
}: {
  selected: boolean;
  title: string;
  subtext: string;
  badge: string;
  value: "optin" | "reengagement" | "reactivation";
  onSelectCard: () => void;
  onSelectClass: (next: "optin" | "reengagement" | "reactivation") => void;
}) {
  return (
    <div
      onClick={onSelectCard}
      style={{
        flex: 1,
        border: selected ? "2px solid #1677ff" : "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        opacity: selected ? 1 : 0.55,
        cursor: "pointer",
        background: "#fff",
      }}
    >
      <Typography.Text strong>{title}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: "6px 0 12px" }}>
        {subtext}
      </Typography.Paragraph>
      <Radio.Group
        value={selected ? value : undefined}
        onChange={(event) => {
          onSelectCard();
          onSelectClass(event.target.value);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {SEQUENCE_RADIOS.map((row) => (
          <Radio key={row.classId} value={row.classId}>
            <Space direction="vertical" size={0}>
              <Typography.Text>{row.label}</Typography.Text>
              <Tag color={selected ? "blue" : "default"} style={{ marginInlineEnd: 0 }}>
                {badge}
              </Tag>
            </Space>
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
}

export function ActionAgentsModal({
  open,
  data,
  listingKeys,
  onCancel,
  onSave,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  data: WorkflowNodeData;
  listingKeys?: string[];
  onCancel: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [assignMode, setAssignMode] = useState<"existing" | "from_template">(data.assignMode ?? "existing");
  const [sequenceClass, setSequenceClass] = useState<"optin" | "reengagement" | "reactivation">(
    data.copySequenceClass ??
      WORKFLOW_AGENT_OPTIONS.find((row) => row.id === data.agentRef)?.sequenceClass ??
      "optin",
  );
  const [objectiveKind, setObjectiveKind] = useState<"click" | "form" | "meeting" | undefined>(
    data.objectiveKind,
  );
  const [slots, setSlots] = useState<Record<string, MappedChip[]>>(data.mappedSlots ?? {});

  useEffect(() => {
    if (!open) return;
    setAssignMode(data.assignMode ?? "existing");
    setSequenceClass(
      data.copySequenceClass ??
        (WORKFLOW_AGENT_OPTIONS.find((row) => row.id === data.agentRef)?.sequenceClass as
          | "optin"
          | "reengagement"
          | "reactivation"
          | undefined) ??
        "optin",
    );
    setObjectiveKind(data.objectiveKind);
    setSlots(data.mappedSlots ?? {});
  }, [open, data]);

  const agentRef = SEQUENCE_RADIOS.find((row) => row.classId === sequenceClass)?.id ?? "tpl.optin_launch.v1";
  const formChips = (slots.form ?? []).filter(
    (chip) => chip.table === "missing_fact_signals" && !chip.field,
  );
  const occupied = formChips.length > 0;
  const questions = occupied ? (listingKeys ?? []) : [];

  const commit = () =>
    onSave({
      actionType: "call_agent",
      assignMode,
      copySequenceClass: sequenceClass,
      agentRef,
      objectiveKind,
      mappedSlots: slots,
      configured: Boolean(objectiveKind),
      actionSummary:
        assignMode === "existing" ? `Call agent · ${agentRef}` : `Copy ${sequenceClass} template`,
      label:
        data.label?.startsWith("Call") || !data.label
          ? `Call ${SEQUENCE_RADIOS.find((row) => row.classId === sequenceClass)?.label ?? "agent"}`
          : data.label,
    });

  useEffect(() => {
    if (embed && open) onRegisterSave?.(commit);
  });

  const body = (
      <>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        You do not create an agent here. Create the agent in Agents, then assign.
      </Typography.Paragraph>
      <Radio.Group
        value={objectiveKind}
        onChange={(event) => setObjectiveKind(event.target.value)}
        style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
      >
        <Radio value="click">Click this link</Radio>
        <Radio value="form">Submit this form</Radio>
        <Radio value="meeting">Book a meeting</Radio>
      </Radio.Group>
      {objectiveKind === "form" ? (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ display: "block", marginBottom: 6 }}>Form</Typography.Text>
          <MappedSlot
            chips={formChips}
            onRemove={() => {
              const next = { ...slots };
              delete next.form;
              setSlots(next);
            }}
            onDropChip={(chip) => {
              if (chip.table !== "missing_fact_signals" || chip.field) return;
              setSlots({
                ...slots,
                form: [
                  {
                    fromNodeId: chip.fromNodeId,
                    table: "missing_fact_signals",
                    label: "Required data",
                    origin: chip.origin,
                  },
                ],
              });
            }}
          >
            <Input placeholder="Drop Required data" disabled />
          </MappedSlot>
          {occupied ? (
            <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 10 }}>
              {questions.map((key, index) => (
                <div
                  key={`${key}-${index}`}
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                  }}
                >
                  <Typography.Text>
                    {index + 1}. {collectibleLabel(key)}
                  </Typography.Text>
                </div>
              ))}
            </Space>
          ) : null}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <AssignCard
          selected={assignMode === "existing"}
          title="Assign to an existing sequence"
          subtext="Put them on a sequence you already authored."
          badge="Existing"
          value={sequenceClass}
          onSelectCard={() => setAssignMode("existing")}
          onSelectClass={setSequenceClass}
        />
        <AssignCard
          selected={assignMode === "from_template"}
          title="Create from a template"
          subtext="Make a new copy from a sequence template, then put them on that."
          badge="Sequence template"
          value={sequenceClass}
          onSelectCard={() => setAssignMode("from_template")}
          onSelectClass={setSequenceClass}
        />
      </div>
      </>
  );

  if (embed) return body;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      title={
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Action · Agents
          </Typography.Title>
        </div>
      }
      width={860}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={commit}>
            Save
          </Button>
        </Space>
      }
    >
      {body}
    </Modal>
  );
}

export function ActionInAppModal({
  open,
  data,
  onCancel,
  onSave,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  data: WorkflowNodeData;
  onCancel: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const picked = inAppAffordance(data.inAppAffordance) ?? (data.actionType === "run_audit" ? inAppAffordance("start_audit") : undefined);
  const addTag = data.actionType === "ascribe_tag" && !data.inAppAffordance;
  const [query, setQuery] = useState("");
  const [filename, setFilename] = useState(typeof data.actionSummary === "string" ? data.actionSummary : "");
  const [firmName, setFirmName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState(data.tag ?? "");
  const [tagQuery, setTagQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTag(data.tag ?? "");
    setTagQuery("");
  }, [open, data.inAppAffordance, data.tag]);

  const hay = query.trim().toLowerCase();
  const grouped = useMemo(() => {
    return inAppModules()
      .map((module) => ({
        module,
        rows: IN_APP_AFFORDANCES.filter(
          (row) =>
            row.module === module &&
            (!hay ||
              row.label.toLowerCase().includes(hay) ||
              row.module.toLowerCase().includes(hay)),
        ),
      }))
      .filter((group) => group.rows.length > 0);
  }, [hay]);

  const slotChips = (slot: string): MappedChip[] => data.mappedSlots?.[slot] ?? [];
  const setSlot = (slot: string, chips: MappedChip[]) => {
    onSave({
      mappedSlots: { ...(data.mappedSlots ?? {}), [slot]: chips },
      configured: true,
    });
  };

  const pick = (id: InAppAffordanceId) => {
    const row = inAppAffordance(id);
    if (!row) return;
    onSave({
      inAppAffordance: row.id,
      actionType: row.actionType ?? undefined,
      configured: true,
      label: row.label,
      actionSummary: row.params === "filename" ? filename || row.label : row.label,
      agentRef: undefined,
      pickTable: row.params === "book" ? "import_batch" : data.pickTable,
    });
  };

  const commit = () => {
    if (addTag) {
      const stock = !data.label || data.label === "Action" || data.label === "Ascribe a tag";
      onSave({
        actionType: "ascribe_tag",
        tag,
        configured: true,
        label: stock ? ACTION_TYPE_DEFAULT_LABELS.ascribe_tag : data.label,
        actionSummary: ACTION_TYPE_DEFAULT_LABELS.ascribe_tag,
      });
      return;
    }
    if (!picked) return;
    onSave({
      inAppAffordance: picked.id,
      actionType: picked.actionType ?? undefined,
      configured: true,
      label: picked.label,
      actionSummary: picked.params === "filename" ? filename || picked.label : picked.label,
      agentRef: undefined,
    });
  };

  useEffect(() => {
    if (embed && open) onRegisterSave?.(commit);
  });

  const mappedField = (slot: string, placeholder: string, value?: string, onChange?: (next: string) => void) => (
    <MappedSlot
      chips={slotChips(slot)}
      onRemove={(index) => setSlot(slot, slotChips(slot).filter((_, i) => i !== index))}
      onDropChip={(chip) => setSlot(slot, [...slotChips(slot), chip])}
    >
      <Input
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        disabled={!onChange}
      />
    </MappedSlot>
  );

  const labeled = (caption: string, body: ReactNode) => (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
        {caption}
      </Typography.Text>
      {body}
    </div>
  );

  const parametersFor = (row: InAppAffordance): ReactNode => {
    if (row.params === "book") {
      return labeled("Book", mappedField("set", "Drop import_batch or contacts"));
    }
    if (row.params === "filename") {
      return labeled(
        "Filename",
        <Input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="book.csv" />,
      );
    }
    if (row.params === "provision") {
      return (
        <>
          {labeled("Firm name", mappedField("name", "Firm name", firmName, setFirmName))}
          {labeled("Website", <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" />)}
          {labeled("Email", mappedField("email", "consultant@firm.example", email, setEmail))}
        </>
      );
    }
    if (row.params === "invite") {
      return (
        <>
          {labeled("Firm", mappedField("firm", "Drop firm"))}
          {labeled("Email", mappedField("email", "consultant@firm.example", email, setEmail))}
        </>
      );
    }
    if (row.params === "firm") {
      return labeled("Firm", mappedField("firm", "Drop firm"));
    }
    if (row.params === "firm_contact") {
      return (
        <>
          {labeled("Firm", mappedField("firm", "Drop firm"))}
          {labeled("Contact", mappedField("contact", "Drop contact"))}
        </>
      );
    }
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        —
      </Typography.Text>
    );
  };

  const parameters = picked ? (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {parametersFor(picked)}
    </Space>
  ) : null;

  const inventory = (
    <div>
      <Input.Search
        placeholder="Search actions"
        allowClear
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{ marginBottom: 12 }}
      />
      {grouped.length === 0 ? (
        <Typography.Text type="secondary">—</Typography.Text>
      ) : (
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {grouped.map((group) => (
            <div key={group.module} style={{ marginBottom: 14 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                {group.module}
              </Typography.Text>
              {group.rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => pick(row.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    marginBottom: 4,
                    borderRadius: 6,
                    border: picked?.id === row.id ? "1px solid #1677ff" : "1px solid #f0f0f0",
                    background: picked?.id === row.id ? "#e6f4ff" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {row.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tagOptions = useMemo(() => {
    const known = ["invalid", "valid", tag, tagQuery].filter((value) => Boolean(value));
    return [...new Set(known)].map((value) => ({ value, label: value }));
  }, [tag, tagQuery]);

  const addTagParameters = (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {labeled(
        "Contact",
        <MappedSlot
          chips={slotChips("contact")}
          onRemove={(index) => setSlot("contact", slotChips("contact").filter((_, i) => i !== index))}
          onDropChip={(chip) => setSlot("contact", [...slotChips("contact"), chip])}
        >
          <Select showSearch placeholder="Contact" style={{ width: "100%" }} options={[]} />
        </MappedSlot>,
      )}
      {labeled(
        "Tag",
        <Select
          showSearch
          allowClear
          placeholder="Tag"
          style={{ width: "100%" }}
          value={tag || undefined}
          options={tagOptions}
          onSearch={setTagQuery}
          onChange={(value) => {
            setTag(value ?? "");
            setTagQuery("");
          }}
          onInputKeyDown={(event) => {
            if (event.key === "Enter" && tagQuery) setTag(tagQuery);
          }}
        />,
      )}
    </Space>
  );

  const body = (
    <>
      {picked && !addTag ? (
        <Tag
          style={{ cursor: "pointer", marginBottom: 12 }}
          onClick={() =>
            onSave({
              inAppAffordance: undefined,
              actionType: undefined,
              configured: false,
              label: "Action",
            })
          }
        >
          {picked.module}
        </Tag>
      ) : null}
      {addTag ? addTagParameters : picked ? parameters : inventory}
    </>
  );

  if (embed) return body;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      title={
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Action · In the application
          </Typography.Title>
        </div>
      }
      width={520}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={commit} disabled={!picked && !addTag}>
            Save
          </Button>
        </Space>
      }
    >
      {body}
    </Modal>
  );
}
