import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppstoreOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Radio, Space, Switch, Tag, Typography } from "antd";
import { COLLECTIBLE_FIELDS } from "../../../../data/collectibleFields";
import {
  IN_APP_AFFORDANCES,
  inAppAffordance,
  inAppModules,
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            At least two kinds of actions.
          </Typography.Text>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={commit}>
              Save
            </Button>
          </Space>
        </div>
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
  listingIds,
  onCancel,
  onSave,
  onChangeKind,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  data: WorkflowNodeData;
  listingIds: string[];
  onCancel: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  onChangeKind: () => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [assignMode, setAssignMode] = useState<"existing" | "from_template">(data.assignMode ?? "existing");
  const [sequenceClass, setSequenceClass] = useState<"optin" | "reengagement" | "reactivation">(
    data.copySequenceClass ??
      WORKFLOW_AGENT_OPTIONS.find((row) => row.id === data.agentRef)?.sequenceClass ??
      "optin",
  );
  const [objectiveName, setObjectiveName] = useState(data.objectiveName ?? "");
  const [dataRequestOn, setDataRequestOn] = useState(data.dataRequestOn ?? true);

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
    setObjectiveName(data.objectiveName ?? "");
    setDataRequestOn(data.dataRequestOn ?? true);
  }, [open, data]);

  const agentRef = SEQUENCE_RADIOS.find((row) => row.classId === sequenceClass)?.id ?? "tpl.optin_launch.v1";
  const listing = COLLECTIBLE_FIELDS.filter((field) =>
    listingIds.length ? listingIds.includes(field.id) : field.capture === "self_reportable",
  );
  const formRows = listing.filter((field) => field.capture === "self_reportable");
  const typeFor = (id: string) => {
    if (id.includes("hours") || id.includes("years") || id.includes("score")) return "Number";
    if (id.includes("updated") || id.includes("date")) return "Date";
    return "Short text";
  };

  const commit = () =>
    onSave({
      actionType: "call_agent",
      assignMode,
      copySequenceClass: sequenceClass,
      agentRef,
      objectiveName,
      dataRequestOn,
      formQuestionIds: formRows.map((row) => row.id),
      configured: true,
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
      <Space size={6} style={{ marginBottom: 12 }}>
        <Tag color="blue" style={{ cursor: "pointer" }} onClick={onChangeKind}>
          Kind
        </Tag>
        <Tag color="blue">Agents</Tag>
      </Space>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        You do not create an agent here. Create the agent in Agents, then assign.
      </Typography.Paragraph>
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
      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          The objective limits which agents you can select.
        </Typography.Text>
        <Typography.Title level={5} style={{ marginTop: 8 }}>
          2 · Create the objective
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          If you create the objective, you create the form. Automations owns the form. Objective is a data request.
        </Typography.Paragraph>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Objective name
        </Typography.Text>
        <Input
          value={objectiveName}
          onChange={(event) => setObjectiveName(event.target.value)}
          placeholder="Enter objective name"
          style={{ marginBottom: 12, maxWidth: 420 }}
        />
        <Space style={{ marginBottom: 12 }}>
          <Typography.Text>Data request — fill this form</Typography.Text>
          <Switch checked={dataRequestOn} onChange={setDataRequestOn} />
        </Space>
        {dataRequestOn ? (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <div
              style={{
                background: "#e6f4ff",
                borderRadius: 6,
                padding: "8px 10px",
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              Questions from required data (rule output).
            </div>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {formRows.map((field, index) => (
                <div
                  key={field.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                  }}
                >
                  <Typography.Text>
                    {index + 1}. {field.label} · {typeFor(field.id)}
                  </Typography.Text>
                  <Tag color="blue">from listing</Tag>
                </div>
              ))}
            </Space>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: "10px 0 0" }}>
              Document-dependent fields (ECA status, job offer) never enter this form. The form references the listing.
              Questions are the required fields.
            </Typography.Paragraph>
          </div>
        ) : null}
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
  onChangeKind,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  data: WorkflowNodeData;
  onCancel: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  onChangeKind: () => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const picked = inAppAffordance(data.inAppAffordance) ?? (data.actionType === "run_audit" ? inAppAffordance("start_audit") : undefined);
  const legacyTag = data.actionType === "ascribe_tag" && !data.inAppAffordance;
  const [query, setQuery] = useState("");
  const [filename, setFilename] = useState(typeof data.actionSummary === "string" ? data.actionSummary : "");
  const [firmName, setFirmName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState(data.tag ?? "");
  const [notesFromVerdict, setNotesFromVerdict] = useState(data.notesFromVerdict === true);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open, data.inAppAffordance]);

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

  const pick = (id: (typeof IN_APP_AFFORDANCES)[number]["id"]) => {
    const row = inAppAffordance(id);
    if (!row) return;
    onSave({
      inAppAffordance: row.id,
      actionType: row.actionType ?? undefined,
      configured: true,
      label: row.label,
      actionSummary: row.label,
      agentRef: undefined,
      pickTable: row.id === "start_audit" ? "import_batch" : data.pickTable,
    });
  };

  const commit = () => {
    if (legacyTag) {
      onSave({
        actionType: "ascribe_tag",
        tag,
        notesFromVerdict,
        configured: true,
        label: data.label || "Ascribe a tag",
      });
      return;
    }
    if (!picked) return;
    onSave({
      inAppAffordance: picked.id,
      actionType: picked.actionType ?? undefined,
      configured: true,
      label: picked.label,
      actionSummary: picked.id === "confirm_book" ? filename || picked.label : picked.label,
      agentRef: undefined,
    });
  };

  useEffect(() => {
    if (embed && open) onRegisterSave?.(commit);
  });

  const parameters = picked ? (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {picked.id === "start_audit" ? (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Book
          </Typography.Text>
          <MappedSlot
            chips={slotChips("set")}
            onRemove={(index) => setSlot("set", slotChips("set").filter((_, i) => i !== index))}
            onDropChip={(chip) => setSlot("set", [...slotChips("set"), chip])}
          >
            <Input placeholder="Drop import_batch or contacts" disabled />
          </MappedSlot>
        </div>
      ) : null}
      {picked.id === "confirm_book" ? (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Filename
          </Typography.Text>
          <Input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="book.csv" />
        </div>
      ) : null}
      {picked.id === "provision" ? (
        <>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Firm name
            </Typography.Text>
            <MappedSlot
              chips={slotChips("name")}
              onRemove={(index) => setSlot("name", slotChips("name").filter((_, i) => i !== index))}
              onDropChip={(chip) => setSlot("name", [...slotChips("name"), chip])}
            >
              <Input value={firmName} onChange={(event) => setFirmName(event.target.value)} placeholder="Firm name" />
            </MappedSlot>
          </div>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Website
            </Typography.Text>
            <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" />
          </div>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Email
            </Typography.Text>
            <MappedSlot
              chips={slotChips("email")}
              onRemove={(index) => setSlot("email", slotChips("email").filter((_, i) => i !== index))}
              onDropChip={(chip) => setSlot("email", [...slotChips("email"), chip])}
            >
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="consultant@firm.example" />
            </MappedSlot>
          </div>
        </>
      ) : null}
    </Space>
  ) : null;

  const inventory = (
    <div>
      <Input.Search
        placeholder="Search"
        allowClear
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{ marginBottom: 12 }}
      />
      {grouped.length === 0 ? (
        <Typography.Text type="secondary">—</Typography.Text>
      ) : (
        grouped.map((group) => (
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
        ))
      )}
    </div>
  );

  const body = (
    <>
      <Space size={6} style={{ marginBottom: 12 }}>
        <Tag color="blue" style={{ cursor: "pointer" }} onClick={onChangeKind}>
          Kind
        </Tag>
        <Tag>In the application</Tag>
        {picked ? (
          <Tag
            style={{ cursor: "pointer" }}
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
      </Space>
      {legacyTag ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Tag" />
          <Space>
            <Switch checked={notesFromVerdict} onChange={setNotesFromVerdict} />
            <Typography.Text>Notes from verdict</Typography.Text>
          </Space>
        </Space>
      ) : picked ? (
        parameters
      ) : (
        inventory
      )}
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
          <Button type="primary" onClick={commit} disabled={!picked}>
            Save
          </Button>
        </Space>
      }
    >
      {body}
    </Modal>
  );
}
