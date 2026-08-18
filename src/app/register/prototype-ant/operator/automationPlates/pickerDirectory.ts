import { wirePorts } from "../../../../wire/registry";
import { standInMachineApi } from "../../../../wire/standins/machineApi";

export type PickerContact = {
  id: string;
  name: string | null;
  email: string | null;
  firmId?: string | null;
  firmName?: string | null;
  createdAt?: string | null;
};

export type PickerFirm = { value: string; label: string };

/** Firms from consultants + the book. If the real wire is down, use the in-browser book. */
export async function loadPickerDirectory(): Promise<{
  contacts: PickerContact[];
  firms: PickerFirm[];
}> {
  const api = wirePorts.machineApi;
  let contacts: PickerContact[] = [];
  let consultants: Array<{ firmId: string; firmName: string }> = [];
  let contactsOk = false;
  let consultantsOk = false;

  try {
    contacts = await api.listContactRecords({ scope: "every_firm" });
    contactsOk = true;
  } catch {
    /* real wire missing or unauthorized */
  }
  try {
    consultants = await api.listConsultants();
    consultantsOk = true;
  } catch {
    /* same */
  }

  if (!contactsOk && !consultantsOk) {
    try {
      contacts = await standInMachineApi.listContactRecords({ scope: "every_firm" });
    } catch {
      contacts = [];
    }
    try {
      consultants = await standInMachineApi.listConsultants();
    } catch {
      consultants = [];
    }
  }

  const firmMap = new Map<string, string>();
  for (const row of consultants) {
    const id = row.firmId?.trim();
    if (!id) continue;
    firmMap.set(id, row.firmName?.trim() || id);
  }
  for (const row of contacts) {
    const id = row.firmId?.trim();
    if (!id) continue;
    if (!firmMap.has(id)) firmMap.set(id, row.firmName?.trim() || id);
  }

  return {
    contacts: contacts.map((row) => ({
      id: row.id,
      name: row.name ?? null,
      email: row.email ?? null,
      firmId: row.firmId,
      firmName: row.firmName,
      createdAt: row.createdAt,
    })),
    firms: [...firmMap.entries()].map(([value, label]) => ({ value, label })),
  };
}
