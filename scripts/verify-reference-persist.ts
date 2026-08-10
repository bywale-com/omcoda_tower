/**
 * Trial: edit modular reference row value → upsertReference → listReferenceVersions holds that value.
 * Uses stand-in machineApi (in-process). Cascade alone does not count.
 */
import { standInMachineApi } from "../src/app/wire/standins/machineApi";
import {
  formatReferenceCellValue,
  seedReferenceDraft,
} from "../src/app/register/prototype/shared/referenceDraft";

async function main() {
  const industry = "immigration" as const;
  const draft = seedReferenceDraft(industry);
  if (!draft.length) throw new Error("no seed rows");
  const target = draft[0];
  const edited =
    typeof target.value === "number" ? target.value + 17 : `${String(target.value)}-edited`;
  target.value = edited;

  const version = 99;
  const referenceId = `ref.reference.${industry}.local`;
  const payload = {
    industry,
    label: "Immigration",
    version: `v${version}`,
    rows: draft.map((r) => ({
      key: r.key,
      label: r.label,
      value: r.value,
      type: r.type,
    })),
  };

  const result = await standInMachineApi.upsertReference({
    id: referenceId,
    key: `reference.${industry}`,
    payload,
    version,
  });

  const stored = (await standInMachineApi.listReferenceVersions()).find(
    (v) => v.id === result.referenceId || v.key === `reference.${industry}`,
  );
  if (!stored) throw new Error("reference_versions row missing after upsert");
  const rows = Array.isArray(stored.payload?.rows)
    ? (stored.payload.rows as Array<{ key: string; value: unknown }>)
    : [];
  const persisted = rows.find((r) => r.key === target.key)?.value;
  if (persisted !== edited) {
    throw new Error(
      `FALSE MAP: expected ${target.key}=${formatReferenceCellValue(edited as never)}, got ${String(persisted)}`,
    );
  }

  console.log(
    `PASS · ${target.key}=${formatReferenceCellValue(edited as never)} persisted in reference_versions (${result.referenceId})`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
