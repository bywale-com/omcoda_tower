import { useEffect, useState, type ReactNode } from "react";
import { Button, Input, Modal, Space, Tabs, Tag, Typography } from "antd";
import type { Edge, Node } from "@xyflow/react";
import type { WorkflowNodeData, WorkflowNodeType } from "../../../../data/automationWorkflows";
import { MODAL_SCROLL } from "../modalScroll";
import { PLATE_NODE_TAG } from "./plateChrome";
import { InputPane } from "./InputPane";
import { OutputPane } from "./OutputPane";

export function NodeInteriorModal({
  open,
  node,
  nodes,
  edges,
  parameters,
  outcomes,
  onCancel,
  onSave,
  extraFooter,
}: {
  open: boolean;
  node: Node<WorkflowNodeData> | undefined;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  parameters?: ReactNode;
  outcomes?: ReactNode;
  onCancel: () => void;
  onSave: (label: string) => void;
  extraFooter?: ReactNode;
}) {
  const kind = (node?.type ?? "action") as WorkflowNodeType;
  const chip = PLATE_NODE_TAG[kind] ?? PLATE_NODE_TAG.action;
  const [tab, setTab] = useState(kind === "rule" ? "outcomes" : "input");
  const [label, setLabel] = useState(node?.data.label ?? "");

  useEffect(() => {
    if (!open) return;
    setLabel(node?.data.label ?? "");
    setTab(kind === "rule" ? "outcomes" : "input");
  }, [open, node?.id, kind]);

  const items = [
    {
      key: "input",
      label: "Input",
      children: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: parameters ? "1fr 320px" : "1fr",
            gap: 16,
            minHeight: 280,
          }}
        >
          <InputPane nodeId={node?.id ?? ""} nodes={nodes} edges={edges} />
          {parameters ? (
            <div style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: 16 }}>{parameters}</div>
          ) : null}
        </div>
      ),
    },
    ...(outcomes
      ? [
          {
            key: "outcomes",
            label: "Outcomes",
            children: outcomes,
          },
        ]
      : []),
    {
      key: "output",
      label: "Output",
      children: node ? <OutputPane data={node.data} /> : null,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      width={1040}
      title={
        <div>
          <Input
            value={label}
            variant="borderless"
            onChange={(event) => setLabel(event.target.value)}
            onBlur={() => {
              if (node && label !== node.data.label) {
                /* parent owns patch via save; keep local until save */
              }
            }}
            style={{ fontSize: 20, fontWeight: 600, paddingInline: 0 }}
          />
          <Tag color={undefined} style={{ background: chip.bg, color: chip.color, border: 0, marginTop: 4 }}>
            {chip.label}
          </Tag>
        </div>
      }
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{extraFooter}</span>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={() => onSave(label)}>
              Save
            </Button>
          </Space>
        </div>
      }
    >
      <Tabs activeKey={tab} onChange={setTab} items={items} />
    </Modal>
  );
}
