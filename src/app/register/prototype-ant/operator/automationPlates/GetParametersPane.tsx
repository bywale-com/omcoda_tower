import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Modal, Select, Space, Table, Typography } from "antd";
import { GET_MODULES, getModuleSpec } from "../../../../data/automationGet";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { wirePorts } from "../../../../wire/registry";
import { MODAL_SCROLL } from "../modalScroll";

type BookRow = {
  id: string;
  name: string | null;
  email: string | null;
  firmId?: string | null;
  firmName?: string | null;
};

type Option = { value: string; label: string };

export function GetParametersPane({
  data,
  onPatch,
  book,
  upstreamIds,
}: {
  data: WorkflowNodeData;
  onPatch: (patch: Partial<WorkflowNodeData>) => void;
  book: BookRow[];
  upstreamIds: string[];
}) {
  const spec = getModuleSpec(data.getModule);
  const select = data.getSelect ?? "every";
  const [audits, setAudits] = useState<Option[]>([]);
  const [sequences, setSequences] = useState<Option[]>([]);
  const [campaigns, setCampaigns] = useState<Option[]>([]);
  const [class2Open, setClass2Open] = useState(false);
  const [picked, setPicked] = useState<string[]>(data.getClass2 ?? []);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void wirePorts.machineApi.listAuditRuns().then((rows) => {
      setAudits(rows.map((row) => ({ value: row.id, label: row.id })));
    }).catch(() => undefined);
    void wirePorts.machineApi.listTemplates().then(({ templates }) => {
      setSequences(templates.map((row) => ({ value: row.id, label: row.label || row.id })));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (spec.id !== "agents" || !data.getClass1) {
      setCampaigns([]);
      return;
    }
    void wirePorts.machineApi.listSequenceHousing(data.getClass1).then(({ campaigns: rows }) => {
      setCampaigns(rows.map((row) => ({ value: row.id, label: row.name || row.id })));
    }).catch(() => setCampaigns([]));
  }, [spec.id, data.getClass1]);

  const firms = useMemo<Option[]>(() => {
    const map = new Map<string, string>();
    for (const row of book) {
      const id = row.firmId?.trim();
      if (!id) continue;
      map.set(id, row.firmName?.trim() || id);
    }
    for (const id of upstreamIds) {
      if (!map.has(id)) map.set(id, id);
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [book, upstreamIds]);

  const contactsOfFirm = useMemo(
    () => book.filter((row) => row.firmId === data.getClass1),
    [book, data.getClass1],
  );

  const class2Options = useMemo<Option[]>(() => {
    if (spec.id === "contacts") {
      return contactsOfFirm.map((row) => ({
        value: row.id,
        label: row.name || row.email || row.id,
      }));
    }
    if (spec.id === "audits") {
      return audits;
    }
    if (spec.id === "agents") {
      return campaigns;
    }
    return [];
  }, [spec.id, contactsOfFirm, audits, campaigns]);

  const allSelected = data.getClass2All !== false && !(data.getClass2?.length);
  const class2Label = allSelected
    ? `All ${spec.class2Label?.toLowerCase() ?? "records"}`
    : `${data.getClass2?.length ?? 0} selected`;

  const restamp = (module: string) => {
    const next = getModuleSpec(module);
    onPatch({
      getModule: next.id,
      getSelect: "select",
      getClass1: undefined,
      getClass2: [],
      getClass2All: true,
      configured: next.silent ? true : false,
      label: next.silent ? "Get" : `Get · ${next.label}`,
    });
  };

  if (spec.silent) {
    return (
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Module
          </Typography.Text>
          <Select
            value={spec.id}
            style={{ width: "100%" }}
            options={GET_MODULES.map((row) => ({ value: row.id, label: row.label }))}
            onChange={restamp}
          />
        </div>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Module
        </Typography.Text>
        <Select
          value={spec.id}
          style={{ width: "100%" }}
          options={GET_MODULES.map((row) => ({ value: row.id, label: row.label }))}
          onChange={restamp}
        />
      </div>
      <div>
        <Select
          value={select}
          style={{ width: "100%" }}
          options={[
            { value: "every", label: spec.level1Every },
            { value: "select", label: spec.level1Select },
          ]}
          onChange={(value: "every" | "select") =>
            onPatch({
              getSelect: value,
              getClass1: value === "every" ? undefined : data.getClass1,
              getClass2: value === "every" ? [] : data.getClass2,
              getClass2All: true,
              configured: value === "every" || Boolean(data.getClass1),
            })
          }
        />
      </div>
      {select === "select" ? (
        <>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              {spec.class1Label}
            </Typography.Text>
            <Select
              showSearch
              allowClear
              placeholder={spec.class1Label}
              style={{ width: "100%" }}
              value={data.getClass1 || undefined}
              options={spec.id === "agents" ? sequences : firms}
              optionFilterProp="label"
              onChange={(value) =>
                onPatch({
                  getClass1: value,
                  getClass2: [],
                  getClass2All: true,
                  configured: Boolean(value),
                })
              }
            />
          </div>
          {spec.class2Label && !spec.silentClass2 && data.getClass1 ? (
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                {spec.class2Label}
              </Typography.Text>
              <Button
                block
                style={{ textAlign: "left", height: 32 }}
                onClick={() => {
                  setPicked(allSelected ? class2Options.map((row) => row.value) : (data.getClass2 ?? []));
                  setQuery("");
                  setClass2Open(true);
                }}
              >
                {class2Label}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <Modal
        open={class2Open}
        onCancel={() => setClass2Open(false)}
        {...MODAL_SCROLL}
        title={spec.class2Label}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Space>
              <Button
                onClick={() => setPicked([])}
              >
                Deselect all
              </Button>
              <Button onClick={() => setPicked(class2Options.map((row) => row.value))}>Select all</Button>
            </Space>
            <Space>
              <Button onClick={() => setClass2Open(false)}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => {
                  const all = picked.length === class2Options.length;
                  onPatch({
                    getClass2: all ? [] : picked,
                    getClass2All: all,
                    configured: true,
                  });
                  setClass2Open(false);
                }}
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
        <Input.Search
          placeholder="Search"
          value={query}
          allowClear
          onChange={(event) => setQuery(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        {class2Options.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />
        ) : (
          <Table
            size="small"
            rowKey="value"
            pagination={false}
            dataSource={class2Options.filter((row) => {
              const hay = query.trim().toLowerCase();
              if (!hay) return true;
              return row.label.toLowerCase().includes(hay) || row.value.toLowerCase().includes(hay);
            })}
            rowSelection={{
              selectedRowKeys: picked,
              onChange: (keys) => setPicked(keys.map(String)),
            }}
            columns={[{ title: spec.class2Label ?? "Record", dataIndex: "label" }]}
          />
        )}
      </Modal>
    </Space>
  );
}
