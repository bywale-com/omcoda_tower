import { Input } from "antd";
import type { MappedChip } from "../../../../data/automationWorkflows";
import type { CompareOperand } from "../../../../data/automationCompare";
import { MappedSlot } from "./MappedSlot";

/** Both sides of a compare (and any text box): drop a chip or type. Occupied chip is the value. */
export function CompareOperandBox({
  slot,
  operand,
  chips,
  placeholder,
  onOperand,
  onChips,
}: {
  slot: string;
  operand: CompareOperand;
  chips: MappedChip[];
  placeholder?: string;
  onOperand: (next: CompareOperand) => void;
  onChips: (chips: MappedChip[]) => void;
}) {
  const occupied = operand.mode === "chip" && chips.length > 0;
  return (
    <MappedSlot
      chips={occupied ? chips : []}
      onRemove={() => {
        onChips([]);
        onOperand({ mode: "text", value: "" });
      }}
      onDropChip={(chip) => {
        onChips([chip]);
        onOperand({ mode: "chip", slot });
      }}
    >
      <Input
        value={operand.mode === "text" ? operand.value : ""}
        placeholder={placeholder ?? "Type or drop"}
        onChange={(event) => onOperand({ mode: "text", value: event.target.value })}
      />
    </MappedSlot>
  );
}
