import { useState, type DragEvent, type ReactNode } from "react";
import { CloseOutlined } from "@ant-design/icons";
import type { MappedChip } from "../../../../data/automationWorkflows";
import { HANDLE_CHIP_MIME } from "./InputPane";

/** A31 occupancy: empty = picker (chevron). Mapped = chip fills the same field. No leftover Select. */
export function MappedSlot({
  chips,
  onRemove,
  onDropChip,
  children,
}: {
  chips: MappedChip[];
  onRemove: (index: number) => void;
  onDropChip: (chip: MappedChip) => void;
  children: ReactNode;
}) {
  const [over, setOver] = useState(false);
  const mapped = chips.length > 0;
  const accept = (event: DragEvent) => {
    if ([...event.dataTransfer.types].includes(HANDLE_CHIP_MIME)) event.preventDefault();
  };
  return (
    <div
      onDragOver={(event) => {
        accept(event);
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const raw = event.dataTransfer.getData(HANDLE_CHIP_MIME);
        if (!raw) return;
        try {
          onDropChip(JSON.parse(raw) as MappedChip);
        } catch {
          /* ignore */
        }
      }}
      style={
        mapped
          ? {
              minHeight: 32,
              border: `1px solid ${over ? "#1677ff" : "#d9d9d9"}`,
              borderRadius: 6,
              padding: "3px 8px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              background: over ? "#ede9fe" : "#f3e8ff",
            }
          : over
            ? { outline: "1px solid #1677ff", borderRadius: 6 }
            : undefined
      }
    >
      {mapped
        ? chips.map((chip, index) => (
            <span
              key={`${chip.label}-${index}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#7c3aed",
                color: "#fff",
                borderRadius: 4,
                padding: "1px 8px",
                fontSize: 12,
                lineHeight: "22px",
                maxWidth: "100%",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {chip.origin ? `${chip.label} ${chip.origin}` : chip.label}
              </span>
              <button
                type="button"
                aria-label="Remove"
                onClick={() => onRemove(index)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            </span>
          ))
        : children}
    </div>
  );
}
