import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Space, Tabs } from "antd";
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
  onCancel,
  onSave,
  extraFooter,
}: {
  open: boolean;
  node: Node<WorkflowNodeData> | undefined;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  parameters?: ReactNode;
  onCancel: () => void;
  onSave: (label: string) => void;
  extraFooter?: ReactNode;
}) {
  const kind = (node?.type ?? "action") as WorkflowNodeType;
  const chip = PLATE_NODE_TAG[kind] ?? PLATE_NODE_TAG.action;
  const [tab, setTab] = useState("input");
  const [label, setLabel] = useState(node?.data.label ?? "");
  const [inputClosed, setInputClosed] = useState(false);
  const [size, setSize] = useState({ width: 1040, height: 640 });

  useEffect(() => {
    if (!open) return;
    setLabel(node?.data.label ?? "");
    setTab("input");
    setInputClosed(false);
    setSize({ width: 1040, height: 640 });
  }, [open, node?.id]);

  const startResize = (event: MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = size.width;
    const startH = size.height;
    const move = (ev: MouseEvent) => {
      setSize({
        width: Math.max(640, startW + (ev.clientX - startX)),
        height: Math.max(420, startH + (ev.clientY - startY)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const items = [
    {
      key: "input",
      label: "Input",
      children: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: parameters
              ? inputClosed
                ? "36px 1fr"
                : "1fr 380px"
              : "1fr",
            gap: 16,
            minHeight: 280,
            height: Math.max(280, size.height - 220),
          }}
        >
          {inputClosed && parameters ? (
            <button
              type="button"
              onClick={() => setInputClosed(false)}
              style={{
                border: "1px solid #f0f0f0",
                background: "#fafafa",
                borderRadius: 8,
                cursor: "pointer",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: 12,
                fontWeight: 600,
                color: "#595959",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 8,
              }}
            >
              <RightOutlined />
              Input
            </button>
          ) : (
            <div style={{ minWidth: 0, overflow: "auto" }}>
              {parameters ? (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <Button
                    size="small"
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => setInputClosed(true)}
                  >
                    Close Input
                  </Button>
                </div>
              ) : null}
              <InputPane nodeId={node?.id ?? ""} nodes={nodes} edges={edges} />
            </div>
          )}
          {parameters ? (
            <div style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: 16, overflow: "auto" }}>
              {parameters}
            </div>
          ) : null}
        </div>
      ),
    },
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
      width={size.width}
      title={
        <div>
          <Input
            value={label}
            variant="borderless"
            onChange={(event) => setLabel(event.target.value)}
            style={{ fontSize: 20, fontWeight: 600, paddingInline: 0 }}
          />
          <span
            style={{
              display: "inline-block",
              background: chip.bg,
              color: chip.color,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: "22px",
              padding: "0 10px",
              borderRadius: 4,
              marginTop: 6,
            }}
          >
            {chip.label}
          </span>
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
      styles={{
        ...MODAL_SCROLL.styles,
        body: { ...MODAL_SCROLL.styles.body, maxHeight: size.height - 160, position: "relative" },
      }}
    >
      <div style={{ position: "relative", paddingBottom: 8 }}>
        <Tabs activeKey={tab} onChange={setTab} items={items} />
        <div
          onMouseDown={startResize}
          title="Resize"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 14,
            height: 14,
            cursor: "nwse-resize",
            background:
              "linear-gradient(135deg, transparent 0 40%, #bfbfbf 40% 50%, transparent 50% 70%, #bfbfbf 70% 80%, transparent 80%)",
          }}
        />
      </div>
    </Modal>
  );
}
