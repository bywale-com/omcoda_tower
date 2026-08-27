import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Segmented, Select, Space, Typography } from "antd";
import type { WaitApprover, WaitDurationUnit, WaitShape, WorkflowNodeData } from "../../../../data/automationWorkflows";
import { isWaitConfigured, waitApproverOf, waitShapeOf } from "../../../../data/automationWorkflows";

export function WaitParametersPane({
  data,
  onSave,
  onRegisterSave,
}: {
  data: WorkflowNodeData;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [shape, setShape] = useState<WaitShape>(() => waitShapeOf(data));
  const [title, setTitle] = useState(() => data.title ?? "");
  const [approver, setApprover] = useState<WaitApprover>(() => waitApproverOf(data));
  const [amount, setAmount] = useState<number | null>(() =>
    typeof data.durationAmount === "number" ? data.durationAmount : null,
  );
  const [unit, setUnit] = useState<WaitDurationUnit>(() => data.durationUnit ?? "days");

  useEffect(() => {
    setShape(waitShapeOf(data));
    setTitle(data.title ?? "");
    setApprover(waitApproverOf(data));
    setAmount(typeof data.durationAmount === "number" ? data.durationAmount : null);
    setUnit(data.durationUnit ?? "days");
  }, [data]);

  const commit = () => {
    const patch: Partial<WorkflowNodeData> = {
      shape,
      title: title.trim(),
      approver,
      durationAmount: amount ?? undefined,
      durationUnit: unit,
    };
    if (shape === "approval") {
      patch.label = title.trim() || "Wait";
    } else if (!data.title?.trim()) {
      patch.label = "Wait";
    }
    patch.configured = isWaitConfigured({ ...data, ...patch });
    onSave(patch);
  };

  useEffect(() => {
    onRegisterSave?.(commit);
  });

  return (
    <Form layout="vertical" style={{ maxWidth: 420 }}>
      <Form.Item label="Shape">
        <Segmented
          value={shape}
          onChange={(value) => setShape(value as WaitShape)}
          options={[
            { label: "Wait for approval", value: "approval" },
            { label: "Duration", value: "duration" },
          ]}
        />
      </Form.Item>
      {shape === "approval" ? (
        <>
          <Form.Item label="Title">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
            />
          </Form.Item>
          <Form.Item label="Approver">
            <Segmented
              value={approver}
              onChange={(value) => setApprover(value as WaitApprover)}
              options={[
                { label: "Consultant", value: "consultant" },
                { label: "Operator", value: "operator" },
              ]}
            />
          </Form.Item>
        </>
      ) : (
        <Form.Item label="Duration">
          <Space>
            <InputNumber
              min={1}
              value={amount ?? undefined}
              onChange={(value) => setAmount(typeof value === "number" ? value : null)}
            />
            <Select
              value={unit}
              onChange={(value) => setUnit(value)}
              options={[
                { value: "minutes", label: "minutes" },
                { value: "hours", label: "hours" },
                { value: "days", label: "days" },
              ]}
              style={{ width: 120 }}
            />
          </Space>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
            Parks the run. No desk note.
          </Typography.Text>
        </Form.Item>
      )}
    </Form>
  );
}
