/**
 * C8 / C8b. Every firm · Select from. Select from opens the list; everyone already selected.
 * Agents enroll starts the mission. Automations audience does not.
 */
import { useMemo, useState } from "react";
import { Checkbox, Input, Modal, Radio, Space, Typography } from "antd";
import { MODAL_SCROLL } from "./modalScroll";

export type BookContact = {
  id: string;
  name: string | null;
  email: string | null;
  firmName?: string | null;
};

export function ContactPickModal({
  open,
  title,
  confirmLoading,
  scope,
  contacts,
  selectedIds,
  everyFirmHint,
  onScope,
  onSelectedIds,
  onCancel,
  onOk,
}: {
  open: boolean;
  title: string;
  confirmLoading?: boolean;
  scope: "every_firm" | "select_from";
  contacts: BookContact[];
  selectedIds: string[];
  everyFirmHint: string;
  onScope: (scope: "every_firm" | "select_from") => void;
  onSelectedIds: (ids: string[]) => void;
  onCancel: () => void;
  onOk: () => void;
}) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((row) => {
      const hay = `${row.name ?? ""} ${row.email ?? ""} ${row.firmName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, query]);

  return (
    <Modal
      title={title}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={onOk}
      {...MODAL_SCROLL}
    >
      <Radio.Group
        value={scope}
        onChange={(event) => {
          const next = event.target.value as "every_firm" | "select_from";
          onScope(next);
          if (next === "select_from") onSelectedIds(contacts.map((row) => row.id));
        }}
        style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
      >
        <Radio value="every_firm">Every firm</Radio>
        <Radio value="select_from">Select from</Radio>
      </Radio.Group>
      {scope === "select_from" ? (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Input.Search
            placeholder="Search contacts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            allowClear
          />
          <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
            <Checkbox.Group
              value={selectedIds}
              onChange={(ids) => onSelectedIds(ids as string[])}
              style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}
            >
              {visible.map((row) => (
                <Checkbox key={row.id} value={row.id}>
                  {row.name || row.email || "—"}
                  {row.firmName ? (
                    <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      {row.firmName}
                    </Typography.Text>
                  ) : null}
                </Checkbox>
              ))}
            </Checkbox.Group>
            {visible.length === 0 ? (
              <Typography.Text type="secondary">No contacts in this book.</Typography.Text>
            ) : null}
          </div>
        </Space>
      ) : (
        <Typography.Text type="secondary">{everyFirmHint}</Typography.Text>
      )}
    </Modal>
  );
}
