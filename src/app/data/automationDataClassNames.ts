import { getInitialAudits } from "./audits";
import type { AutomationDataClassId } from "./automationEvents";
import { AUTOMATION_SYSTEM_CONSTANTS } from "./automationConstants";
import { clientList } from "./clients";
import { contactList } from "./contacts";
import { importList } from "./imports";

export type DataClassNameOption = {
  id: string;
  name: string;
};

export function getDataClassNameOptions(classId: AutomationDataClassId): DataClassNameOption[] {
  switch (classId) {
    case "client_data":
      return clientList
        .filter((client) => client.id !== "task")
        .map((client) => ({ id: client.id, name: client.name }));
    case "contact":
      return contactList.map((contact) => ({ id: contact.id, name: contact.name }));
    case "import":
      return importList.map((item) => ({ id: item.id, name: item.label }));
    case "audit":
      return getInitialAudits().map((audit) => ({ id: audit.id, name: audit.label }));
    case "constant":
      return AUTOMATION_SYSTEM_CONSTANTS.map((constant) => ({
        id: constant.key,
        name: constant.key,
      }));
  }
}

export function filterDataClassNameOptions(
  classId: AutomationDataClassId,
  query: string,
): DataClassNameOption[] {
  const options = getDataClassNameOptions(classId);
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return options;
  return options.filter((option) => option.name.toLowerCase().includes(trimmed));
}
