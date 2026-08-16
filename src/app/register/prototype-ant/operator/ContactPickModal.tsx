/**
 * C8 / C8b. Scope: Every firm · Select from.
 * Select from is firms first — pick a firm, its contacts populate, all selected.
 * Operator can deselect people. Agents enroll starts the mission. Automations audience does not.
 */
import { useMemo, useState } from "react";
import { Button, Checkbox, Input, Modal, Radio, Space, Table, Typography } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { MODAL_SCROLL } from "./modalScroll";

export type BookContact = {
  id: string;
  name: string | null;
  email: string | null;
  firmId?: string | null;
  firmName?: string | null;
};

type FirmRow = {
  id: string;
  name: string;
  contactIds: string[];
};

export function ContactPickModal({
  open,
  title,
  confirmLoading,
  scope,
  contacts,
  selectedIds,
  footerHint,
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
  footerHint: string;
  onScope: (scope: "every_firm" | "select_from") => void;
  onSelectedIds: (ids: string[]) => void;
  onCancel: () => void;
  onOk: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);

  const firms = useMemo<FirmRow[]>(() => {
    const byId = new Map<string, FirmRow>();
    for (const row of contacts) {
      const id = row.firmId?.trim() || row.firmName?.trim() || "unknown-firm";
      const name = row.firmName?.trim() || "Firm";
      const current = byId.get(id);
      if (current) {
        current.contactIds.push(row.id);
      } else {
        byId.set(id, { id, name, contactIds: [row.id] });
      }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  const visibleFirms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return firms;
    return firms.filter((firm) => firm.name.toLowerCase().includes(q));
  }, [firms, query]);

  const listedContacts = useMemo(() => {
    const allowed = new Set(
      firms.filter((firm) => selectedFirmIds.includes(firm.id)).flatMap((firm) => firm.contactIds),
    );
    return contacts.filter((row) => allowed.has(row.id));
  }, [contacts, firms, selectedFirmIds]);

  const toggleFirm = (firmId: string, checked: boolean) => {
    const firm = firms.find((row) => row.id === firmId);
    if (!firm) return;
    const nextFirms = checked
      ? [...new Set([...selectedFirmIds, firmId])]
      : selectedFirmIds.filter((id) => id !== firmId);
    setSelectedFirmIds(nextFirms);
    const nextSelected = new Set(selectedIds);
    if (checked) {
      for (const id of firm.contactIds) nextSelected.add(id);
    } else {
      for (const id of firm.contactIds) nextSelected.delete(id);
    }
    onSelectedIds([...nextSelected]);
  };

  return (
    <Modal
      title={title}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={() => {
        setQuery("");
        setSelectedFirmIds([]);
        onCancel();
      }}
      width={640}
      {...MODAL_SCROLL}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            width: "100%",
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: "left" }}>
            {footerHint}
          </Typography.Text>
          <Space>
            <Button
              onClick={() => {
                setQuery("");
                setSelectedFirmIds([]);
                onCancel();
              }}
            >
              Close
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={onOk}>
              Add to sequence
            </Button>
          </Space>
        </div>
      }
    >
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Scope
      </Typography.Text>
      <Radio.Group
        value={scope}
        onChange={(event) => {
          const next = event.target.value as "every_firm" | "select_from";
          onScope(next);
          setQuery("");
          setSelectedFirmIds([]);
          onSelectedIds([]);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}
      >
        <Radio value="every_firm" style={{ alignItems: "flex-start" }}>
          <div>
            <div>Every firm</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              All contacts, every firm.
            </Typography.Text>
          </div>
        </Radio>
        <Radio value="select_from" style={{ alignItems: "flex-start" }}>
          <div>
            <div>Select from</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Search firms. Selecting a firm lists its contacts, all selected. Deselect to pick
              specific contacts.
            </Typography.Text>
          </div>
        </Radio>
      </Radio.Group>
      {scope === "select_from" ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Input.Search
              placeholder="Search firms"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              allowClear
              style={{ flex: 1 }}
            />
            <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
              {selectedIds.length} selected
            </Typography.Text>
          </div>
          <div
            className="tower-overlay-scroll"
            style={{ maxHeight: 132, overflowY: "auto", paddingRight: 4 }}
          >
            {visibleFirms.map((firm) => (
              <label
                key={firm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 4px",
                  cursor: "pointer",
                }}
              >
                <Checkbox
                  checked={selectedFirmIds.includes(firm.id)}
                  onChange={(event) => toggleFirm(firm.id, event.target.checked)}
                />
                <BankOutlined />
                <span>{firm.name}</span>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {firm.contactIds.length} contact{firm.contactIds.length === 1 ? "" : "s"}
                </Typography.Text>
              </label>
            ))}
            {visibleFirms.length === 0 ? (
              <Typography.Text type="secondary">No firms in this book.</Typography.Text>
            ) : null}
          </div>
          <div
            className="tower-overlay-scroll"
            style={{ maxHeight: 280, overflowY: "auto" }}
          >
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={listedContacts}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelectedIds(keys as string[]),
                columnWidth: 48,
              }}
              columns={[
                {
                  title: "Name",
                  dataIndex: "name",
                  render: (_: unknown, row: BookContact) => row.name || row.email || "—",
                },
                {
                  title: "Firm",
                  dataIndex: "firmName",
                  render: (value: string | null | undefined) => value || "—",
                },
              ]}
              locale={{
                emptyText: selectedFirmIds.length
                  ? "No contacts in the selected firms."
                  : "Select a firm to list its contacts.",
              }}
            />
          </div>
        </Space>
      ) : null}
    </Modal>
  );
}
