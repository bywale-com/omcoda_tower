/**
 * Living book for the MAIN product journey at `/`.
 * Reads/writes real machine tables via wirePorts.machineApi (firm-scoped).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { setActiveFirmId } from "../wire/firmContext";
import { wirePorts } from "../wire/registry";
import type { MachineContactRow } from "../wire/ports";
import type { ClientMeta } from "../data/clients";
import type { Contact } from "../data/contacts";
import type { ContactImport } from "../data/imports";
import type { ConfirmedCsvImport } from "../components/imports/csvImportTypes";

type JourneyStatus = {
  authorized: boolean;
  contactCount: number;
  reachableCount: number;
  signalCount: number;
  enrollmentCount: number;
};

type BookContextValue = {
  firmId: string;
  loading: boolean;
  status: JourneyStatus;
  contacts: MachineContactRow[];
  clients: ClientMeta[];
  contactDirectory: Contact[];
  imports: ContactImport[];
  lastMessage: string | null;
  refresh: () => Promise<void>;
  authorizeBook: () => Promise<void>;
  importCsv: (confirmed: ConfirmedCsvImport) => Promise<void>;
  runDetection: () => Promise<void>;
  runOutreach: () => Promise<void>;
};

const BookContext = createContext<BookContextValue | null>(null);

function initials(name: string | null | undefined): string {
  const parts = (name ?? "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function toClient(row: MachineContactRow): ClientMeta {
  const enrolled = Boolean(row.latest_enrollment);
  const motion = row.latest_motion;
  const hasSignal = Boolean(row.latest_signal);
  return {
    id: row.id,
    name: row.name || row.email || row.phone || "Unnamed",
    initials: initials(row.name || row.email),
    status: row.verdict === "reachable" ? "teal" : row.verdict === "partial" ? "amber" : "grey",
    badge: hasSignal
      ? { label: motion === "reactivation" ? "eligible" : "signal", type: "eligible" }
      : enrolled
        ? { label: "enrolled", type: "close" }
        : undefined,
    optedIn: enrolled,
    nudge: { active: motion === "nudge" },
    reactivationPhase: motion === "reactivation" ? (enrolled ? "active" : "armed") : null,
    phaseSnapshot: hasSignal
      ? {
          headline: row.latest_signal ?? "Signal",
          detail: motion ? `Motion · ${motion}` : "Eligibility determination",
          activityNodeId: motion === "reactivation" ? "reactivation" : "opt-in",
        }
      : undefined,
  };
}

function toContact(row: MachineContactRow): Contact {
  return {
    id: row.id,
    name: row.name || row.email || "Unnamed",
    phone: row.phone || "",
    indicator: row.latest_enrollment
      ? "sequenced"
      : row.verdict === "unreachable"
        ? "silenced"
        : "unsequenced",
    clientId: row.id,
  };
}

export function BookProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const firmId = user?.firmId || "firm-cedar";
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<MachineContactRow[]>([]);
  const [imports, setImports] = useState<ContactImport[]>([]);
  const [status, setStatus] = useState<JourneyStatus>({
    authorized: false,
    contactCount: 0,
    reachableCount: 0,
    signalCount: 0,
    enrollmentCount: 0,
  });
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveFirmId(firmId);
  }, [firmId]);

  const refresh = useCallback(async () => {
    setActiveFirmId(firmId);
    setLoading(true);
    try {
      const [st, rows] = await Promise.all([
        wirePorts.machineApi.journeyStatus(),
        wirePorts.machineApi.listContacts(),
      ]);
      setStatus({
        authorized: st.authorized,
        contactCount: st.contactCount,
        reachableCount: st.reachableCount,
        signalCount: st.signalCount,
        enrollmentCount: st.enrollmentCount,
      });
      setContacts(rows);
    } catch (e) {
      setLastMessage(`Book refresh failed: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [firmId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const authorizeBook = useCallback(async () => {
    setActiveFirmId(firmId);
    await wirePorts.machineApi.authorizeBook();
    // Also write via crmOAuth port (same table) for wire registry consistency
    await wirePorts.crmOAuth.grant(firmId, ["book.read", "book.write"]).catch(() => undefined);
    setLastMessage("Book authorized → crm_oauth_grants");
    await refresh();
  }, [firmId, refresh]);

  const importCsv = useCallback(
    async (confirmed: ConfirmedCsvImport) => {
      setActiveFirmId(firmId);
      if (!status.authorized) {
        setLastMessage("Authorize the book before importing.");
        return;
      }
      const result = await wirePorts.machineApi.importContacts({
        fileName: confirmed.fileName,
        contacts: confirmed.contacts,
      });
      setImports((prev) => [
        {
          id: result.importId,
          label: `${confirmed.fileName} · ${result.written} contacts`,
          importedAt: new Date().toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          }),
        },
        ...prev,
      ]);
      setLastMessage(`Imported ${result.written} → contact_records`);
      await refresh();
      // Auto-detect after import
      const detect = await wirePorts.machineApi.journeyDetect();
      setLastMessage(
        `Imported ${result.written}; detection wrote ${detect.signals} signals → eligibility_results`,
      );
      await refresh();
    },
    [firmId, refresh, status.authorized],
  );

  const runDetection = useCallback(async () => {
    setActiveFirmId(firmId);
    const detect = await wirePorts.machineApi.journeyDetect();
    setLastMessage(`Detection: ${detect.signals} signals (${detect.auditRunId})`);
    await refresh();
  }, [firmId, refresh]);

  const runOutreach = useCallback(async () => {
    setActiveFirmId(firmId);
    const out = await wirePorts.machineApi.journeyOutreach();
    setLastMessage(
      `Outreach: ${out.enrollments} enrollments → ${out.agentRef} (dry-run default)`,
    );
    await refresh();
  }, [firmId, refresh]);

  const clients = useMemo(() => contacts.map(toClient), [contacts]);
  const contactDirectory = useMemo(() => contacts.map(toContact), [contacts]);

  const value = useMemo(
    () => ({
      firmId,
      loading,
      status,
      contacts,
      clients,
      contactDirectory,
      imports,
      lastMessage,
      refresh,
      authorizeBook,
      importCsv,
      runDetection,
      runOutreach,
    }),
    [
      firmId,
      loading,
      status,
      contacts,
      clients,
      contactDirectory,
      imports,
      lastMessage,
      refresh,
      authorizeBook,
      importCsv,
      runDetection,
      runOutreach,
    ],
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBook(): BookContextValue {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBook must be used within BookProvider");
  return ctx;
}

/** Safe for Register prototypes that mount BoardPanel without BookProvider. */
export function useOptionalBook(): BookContextValue | null {
  return useContext(BookContext);
}
