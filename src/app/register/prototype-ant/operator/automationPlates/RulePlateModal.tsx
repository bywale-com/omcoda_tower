import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, Segmented, Select, Space, Switch, Table, Tabs, Tag, Typography } from "antd";
import {
  CONDITION_OPERATORS,
} from "../../../../data/automationConditions";
import { COLLECTIBLE_FIELDS } from "../../../../data/collectibleFields";
import {
  emptyRuleNodeConfig,
  getRulePack,
  type RuleConditionDefinition,
  type RuleNodeConfig,
  type RuleOutcomeDefinition,
} from "../../../../data/automationRules";
import { DEFAULT_NAMED_CODE, formatConstantEnvName } from "./plateChrome";
import { MODAL_SCROLL } from "../modalScroll";

function shortField(path: string): string {
  const parts = path.split(".");
  return parts[parts.length - 1] ?? path;
}

function ConditionRow({
  condition,
}: {
  condition: RuleConditionDefinition;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 88px 1fr 28px",
        gap: 8,
        alignItems: "center",
        padding: "8px 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <div>
        <Typography.Text style={{ fontSize: 13 }}>{condition.label}</Typography.Text>
        <Typography.Text type="secondary" style={{ display: "block", fontSize: 11, fontFamily: "ui-monospace, monospace" }}>
          {shortField(condition.leftField)}
        </Typography.Text>
      </div>
      <Select
        size="small"
        value={condition.operator}
        options={CONDITION_OPERATORS.map((op) => ({ value: op.id, label: op.label }))}
        disabled
      />
      <Typography.Text style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
        {formatConstantEnvName(condition.constantKey)}
      </Typography.Text>
      <Typography.Text type="secondary">⋮</Typography.Text>
    </div>
  );
}

function FamilyPanel({
  outcome,
  on,
  onToggle,
}: {
  outcome: RuleOutcomeDefinition;
  on: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        opacity: on ? 1 : 0.55,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Typography.Text strong>{outcome.label}</Typography.Text>
        <Switch checked={on} onChange={onToggle} />
      </div>
      {on ? (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {outcome.conditions.slice(0, 3).map((condition) => (
            <ConditionRow key={condition.id} condition={condition} />
          ))}
          <Button size="small">+ Add condition</Button>
        </Space>
      ) : null}
    </div>
  );
}

function defaultCustomJson(config: RuleNodeConfig): string {
  if (typeof config.customJson === "string" && config.customJson.trim()) return config.customJson;
  if (config.customJson && typeof config.customJson === "object") {
    return JSON.stringify(config.customJson, null, 2);
  }
  return JSON.stringify(
    {
      pack: config.packId,
      outcomes: Object.fromEntries(
        (config.enabledOutcomeIds ?? []).map((id) => [id, true]),
      ),
      conditions: [
        {
          field: "canadian_skilled_hours",
          op: "gte",
          constant: "cec.min_hours",
        },
      ],
    },
    null,
    2,
  );
}

export function RulePlateModal({
  open,
  title,
  config,
  onCancel,
  onSave,
}: {
  open: boolean;
  title: string;
  config: RuleNodeConfig | undefined;
  onCancel: () => void;
  onSave: (next: RuleNodeConfig) => void;
}) {
  const [draft, setDraft] = useState<RuleNodeConfig>(() => config ?? emptyRuleNodeConfig());
  const [tab, setTab] = useState("outcomes");

  useEffect(() => {
    if (open) {
      setDraft(config ?? emptyRuleNodeConfig());
      setTab("outcomes");
    }
  }, [open, config]);

  const pack = getRulePack(draft.packId);
  const mode = draft.authorMode ?? "gui";
  const enabled = new Set(draft.enabledOutcomeIds ?? []);

  const guiFamilies = useMemo(
    () => (pack?.outcomes ?? []).filter((row) => row.family === "pathway" || row.family === "gap" || row.family === "draw"),
    [pack],
  );

  const listingRows = COLLECTIBLE_FIELDS.map((field) => ({
    key: field.id,
    label: field.label,
    capture: field.capture === "self_reportable" ? "self-reportable" : "document-dependent",
    id: field.id,
    form: field.capture === "self_reportable" ? "form" : "never a form",
  }));

  const toggleFamily = (id: string, next: boolean) => {
    const current = draft.enabledOutcomeIds ?? [];
    setDraft({
      ...draft,
      enabledOutcomeIds: next ? [...new Set([...current, id])] : current.filter((row) => row !== id),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      title={
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title || pack?.label || "Rule"}
          </Typography.Title>
          <Typography.Text type="secondary">Rule</Typography.Text>
        </div>
      }
      width={820}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, maxWidth: 480 }}>
            {mode === "gui"
              ? "A rule is conditions against constants. Toggle families on or off."
              : "When the GUI isn’t enough — same as JSON."}
          </Typography.Text>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={() => onSave({ ...draft, authorMode: mode })}>
              Save
            </Button>
          </Space>
        </div>
      }
    >
      <Segmented
        value={mode}
        onChange={(value) => setDraft({ ...draft, authorMode: value as "gui" | "custom" })}
        options={[
          { label: "GUI", value: "gui" },
          { label: "Custom", value: "custom" },
        ]}
        style={{ marginBottom: 8 }}
      />
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
        {mode === "gui"
          ? "GUI where the logic is this simple. Custom when it isn’t."
          : "When the GUI isn’t enough — same as JSON."}
      </Typography.Paragraph>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "input",
            label: "Input",
            children: (
              <Typography.Paragraph type="secondary">
                This rule reads the previous node’s payload — outreach, existing data, or the trigger event.
              </Typography.Paragraph>
            ),
          },
          {
            key: "outcomes",
            label: "Outcomes",
            children:
              mode === "custom" ? (
                <Input.TextArea
                  value={defaultCustomJson(draft)}
                  onChange={(event) => setDraft({ ...draft, customJson: event.target.value })}
                  autoSize={{ minRows: 14, maxRows: 22 }}
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}
                />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Tag color="blue">GUI</Tag>
                    {guiFamilies.map((outcome) => (
                      <FamilyPanel
                        key={outcome.id}
                        outcome={outcome}
                        on={enabled.has(outcome.id)}
                        onToggle={(next) => toggleFamily(outcome.id, next)}
                      />
                    ))}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Prefer a constant when one exists.
                    </Typography.Text>
                  </Space>
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: 12,
                      opacity: draft.namedCodeOn ? 1 : 0.7,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <Tag color="blue">Named code</Tag>
                      <Switch
                        checked={Boolean(draft.namedCodeOn)}
                        onChange={(namedCodeOn) => setDraft({ ...draft, namedCodeOn })}
                        checkedChildren="on"
                        unCheckedChildren="off"
                      />
                    </div>
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                      Title
                    </Typography.Text>
                    <Input
                      value={draft.namedCodeTitle ?? "Work-permit urgency"}
                      onChange={(event) => setDraft({ ...draft, namedCodeTitle: event.target.value })}
                      style={{ marginBottom: 10 }}
                    />
                    <Input.TextArea
                      value={draft.namedCode || DEFAULT_NAMED_CODE}
                      onChange={(event) => setDraft({ ...draft, namedCode: event.target.value })}
                      autoSize={{ minRows: 8, maxRows: 14 }}
                      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                      Created in this rule. Not hard-coded. Still on or off.
                    </Typography.Text>
                  </div>
                </div>
              ),
          },
          {
            key: "output",
            label: "Output",
            children: (
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                <Space wrap>
                  <Tag>Headline (text)</Tag>
                  <Tag>Pass / fail</Tag>
                  <Tag>
                    Nudge signal{" "}
                    <Switch
                      size="small"
                      checked={draft.nudgeSignalOn !== false}
                      onChange={(nudgeSignalOn) => setDraft({ ...draft, nudgeSignalOn })}
                      style={{ marginLeft: 6 }}
                    />
                  </Tag>
                  <Tag>
                    Reactivation signal{" "}
                    <Switch
                      size="small"
                      checked={draft.reactivationSignalOn !== false}
                      onChange={(reactivationSignalOn) => setDraft({ ...draft, reactivationSignalOn })}
                      style={{ marginLeft: 6 }}
                    />
                  </Tag>
                  <Tag>Recommended services</Tag>
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  One, the other, or both signals. Same data.
                </Typography.Text>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                  <Typography.Text strong>Required data</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 10 }}>
                    A listing — not a flag. More than one field.
                  </Typography.Paragraph>
                  <Table
                    size="small"
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: draft.listingFieldIds ?? listingRows.filter((row) => row.form === "form").map((row) => row.key),
                      onChange: (keys) => setDraft({ ...draft, listingFieldIds: keys as string[] }),
                      getCheckboxProps: (row) => ({ disabled: row.form === "never a form" }),
                    }}
                    columns={[
                      { title: "Field", dataIndex: "label" },
                      { title: "Class", dataIndex: "capture", width: 160 },
                      {
                        title: "Key",
                        dataIndex: "id",
                        render: (id: string) => (
                          <Typography.Text style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{id}</Typography.Text>
                        ),
                      },
                      {
                        title: "",
                        dataIndex: "form",
                        width: 120,
                        render: (value: string) =>
                          value === "form" ? <Tag color="blue">form</Tag> : <Typography.Text type="secondary">never a form</Typography.Text>,
                      },
                    ]}
                    dataSource={listingRows}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 10 }}>
                    This listing is the output class. Form questions come from these rows.
                  </Typography.Text>
                </div>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
}
