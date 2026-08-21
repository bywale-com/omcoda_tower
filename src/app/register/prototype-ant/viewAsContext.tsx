/**
 * Admin view-as: which consultant workspace the Operator shell is looking through.
 * Non-admins never see the dropdown; their firm is always the session firm.
 * Contact ▾ is that firm's book minus workspace opt-out. Token is not required.
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
import { useAuth } from "../../auth/AuthContext";
import { isPlatformAdminEmail } from "../../auth/platformAdmin";
import { isAuthDisabled } from "../../auth/authClient";
import { setActiveFirmId } from "../../wire/sessionFirm";
import { wirePorts } from "../../wire";

export type ConsultantOption = {
  userId: string;
  email: string;
  firmId: string;
  firmName: string;
};

export type ContactWorkspaceOption = {
  id: string;
  name: string | null;
  email: string | null;
};

type ViewAsState = {
  isAdmin: boolean;
  consultants: ConsultantOption[];
  selected: ConsultantOption | null;
  selectConsultant: (firmId: string) => void;
  contactWorkspaces: ContactWorkspaceOption[];
  selectedContact: ContactWorkspaceOption | null;
  selectContact: (contactId: string | null) => void;
  loading: boolean;
};

const ViewAsContext = createContext<ViewAsState | null>(null);

export function ViewAsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  // Prototype (auth bypass) keeps the full modeling shell — same shape as admin.
  const isAdmin = isAuthDisabled() || isPlatformAdminEmail(user?.email);
  const [consultants, setConsultants] = useState<ConsultantOption[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(null);
  const [contactWorkspaces, setContactWorkspaces] = useState<ContactWorkspaceOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      if (user?.firmId) setActiveFirmId(user.firmId);
      setConsultants([]);
      setSelectedFirmId(user?.firmId ?? null);
      setContactWorkspaces([]);
      setSelectedContactId(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void wirePorts.machineApi
      .listConsultants()
      .then((rows) => {
        if (cancelled) return;
        setConsultants(rows);
        setSelectedFirmId((prev) => {
          if (prev && rows.some((r) => r.firmId === prev)) return prev;
          return rows[0]?.firmId ?? user?.firmId ?? null;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setConsultants([]);
        if (user?.firmId) setSelectedFirmId(user.firmId);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, authLoading, user?.firmId, user?.email]);

  useEffect(() => {
    if (!selectedFirmId) return;
    setActiveFirmId(selectedFirmId);
  }, [selectedFirmId]);

  useEffect(() => {
    if (!isAdmin || !selectedFirmId) {
      setContactWorkspaces([]);
      setSelectedContactId(null);
      return;
    }
    let cancelled = false;
    const load = () =>
      wirePorts.machineApi
        .listContactWorkspaces(selectedFirmId)
        .then((rows) => {
          if (cancelled) return;
          setContactWorkspaces(rows);
          setSelectedContactId((prev) => (prev && rows.some((row) => row.id === prev) ? prev : null));
        })
        .catch(() => {
          if (cancelled) return;
          setContactWorkspaces([]);
          setSelectedContactId(null);
        });
    void load();
    const onChange = () => {
      void load();
    };
    window.addEventListener("tower-contact-workspaces-changed", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("tower-contact-workspaces-changed", onChange);
    };
  }, [isAdmin, selectedFirmId]);

  const selected = useMemo(
    () => consultants.find((c) => c.firmId === selectedFirmId) ?? null,
    [consultants, selectedFirmId],
  );

  const selectedContact = useMemo(
    () => contactWorkspaces.find((row) => row.id === selectedContactId) ?? null,
    [contactWorkspaces, selectedContactId],
  );

  const selectConsultant = useCallback((firmId: string) => {
    setSelectedFirmId(firmId);
  }, []);

  const selectContact = useCallback((contactId: string | null) => {
    setSelectedContactId(contactId);
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      consultants,
      selected,
      selectConsultant,
      contactWorkspaces,
      selectedContact,
      selectContact,
      loading,
    }),
    [
      isAdmin,
      consultants,
      selected,
      selectConsultant,
      contactWorkspaces,
      selectedContact,
      selectContact,
      loading,
    ],
  );

  return <ViewAsContext.Provider value={value}>{children}</ViewAsContext.Provider>;
}

export function useViewAs(): ViewAsState {
  const ctx = useContext(ViewAsContext);
  if (!ctx) throw new Error("useViewAs must be used within ViewAsProvider");
  return ctx;
}
