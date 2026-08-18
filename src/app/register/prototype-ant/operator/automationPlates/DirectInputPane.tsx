import { useMemo } from "react";
import { Select, Space, Typography } from "antd";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";

type BookRow = {
  id: string;
  name: string | null;
  email: string | null;
  firmId?: string | null;
  firmName?: string | null;
};

/** Who already exists — Rule Input pick. Not Get’s Every/Select cascade. */
export function DirectInputPane({
  data,
  onPatch,
  book,
}: {
  data: WorkflowNodeData;
  onPatch: (patch: Partial<WorkflowNodeData>) => void;
  book: BookRow[];
}) {
  const firms = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of book) {
      const id = row.firmId?.trim();
      if (!id) continue;
      map.set(id, row.firmName?.trim() || id);
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [book]);

  const contacts = useMemo(
    () => book.filter((row) => (data.directFirmId ? row.firmId === data.directFirmId : true)),
    [book, data.directFirmId],
  );

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Firm
        </Typography.Text>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Who already exists"
          style={{ width: "100%" }}
          value={data.directFirmId || undefined}
          options={firms}
          onChange={(value) =>
            onPatch({
              directFirmId: value,
              directContactIds: [],
            })
          }
        />
      </div>
      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Contact
        </Typography.Text>
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Pick from the book"
          style={{ width: "100%" }}
          value={data.directContactIds ?? []}
          options={contacts.map((row) => ({
            value: row.id,
            label: row.name || row.email || row.id,
          }))}
          onChange={(value) => onPatch({ directContactIds: value })}
        />
      </div>
    </Space>
  );
}
