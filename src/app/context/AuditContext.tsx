import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AUDIT_CHECKS,
  createAuditFromImports,
  finalizeAudit,
  getInitialAudits,
  resolveGateOutcome,
  type Audit,
  type AuditCheckId,
  type AuditGateStep,
} from "../data/audits";

type AuditContextValue = {
  audits: Audit[];
  createAndRunAudit: (importIds: string[]) => Audit;
  updateAuditChecks: (auditId: string, enabledChecks: AuditCheckId[]) => void;
  runAudit: (auditId: string) => void;
  getAuditById: (id: string) => Audit | undefined;
};

const AuditContext = createContext<AuditContextValue | null>(null);

const GATE_STEP_MS = 650;

function updateGateStep(
  steps: AuditGateStep[],
  checkId: AuditCheckId,
  patch: Partial<AuditGateStep>,
): AuditGateStep[] {
  return steps.map((step) => (step.checkId === checkId ? { ...step, ...patch } : step));
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [audits, setAudits] = useState<Audit[]>(() => getInitialAudits());
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const scheduleGateRun = useCallback((audit: Audit) => {
    let delay = 0;

    audit.enabledChecks.forEach((checkId, index) => {
      const runningTimer = window.setTimeout(() => {
        setAudits((current) =>
          current.map((item) =>
            item.id === audit.id
              ? {
                  ...item,
                  gateSteps: updateGateStep(item.gateSteps, checkId, { status: "running" }),
                }
              : item,
          ),
        );
      }, delay);
      timersRef.current.push(runningTimer);
      delay += GATE_STEP_MS;

      const resultTimer = window.setTimeout(() => {
        setAudits((current) =>
          current.map((item) => {
            if (item.id !== audit.id) return item;
            const outcome = resolveGateOutcome(checkId, item.records);
            const nextSteps = updateGateStep(item.gateSteps, checkId, {
              status: outcome,
              durationMs: 40 + Math.floor(Math.random() * 180),
            });
            if (index < audit.enabledChecks.length - 1) {
              return { ...item, gateSteps: nextSteps };
            }
            return finalizeAudit({ ...item, gateSteps: nextSteps });
          }),
        );
      }, delay);
      timersRef.current.push(resultTimer);
      delay += GATE_STEP_MS;
    });
  }, []);

  const createAndRunAudit = useCallback(
    (importIds: string[]) => {
      const audit = createAuditFromImports(importIds, audits.length);
      setAudits((prev) => [audit, ...prev]);
      scheduleGateRun(audit);
      return audit;
    },
    [audits.length, scheduleGateRun],
  );

  const updateAuditChecks = useCallback((auditId: string, enabledChecks: AuditCheckId[]) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId && audit.status === "complete"
          ? { ...audit, enabledChecks }
          : audit,
      ),
    );
  }, []);

  const runAudit = useCallback(
    (auditId: string) => {
      setAudits((prev) => {
        const audit = prev.find((item) => item.id === auditId);
        if (!audit || audit.status !== "complete") return prev;

        const nextAudit: Audit = {
          ...audit,
          status: "running",
          meta: "Running",
          gateSteps: audit.enabledChecks.map((checkId) => ({
            checkId,
            label: AUDIT_CHECKS.find((c) => c.id === checkId)?.label ?? checkId,
            status: "pending",
          })),
        };

        scheduleGateRun(nextAudit);
        return prev.map((item) => (item.id === auditId ? nextAudit : item));
      });
    },
    [scheduleGateRun],
  );

  const getAuditById = useCallback(
    (id: string) => audits.find((audit) => audit.id === id),
    [audits],
  );

  const value = useMemo(
    () => ({ audits, createAndRunAudit, updateAuditChecks, runAudit, getAuditById }),
    [audits, createAndRunAudit, updateAuditChecks, runAudit, getAuditById],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudits() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudits must be used within AuditProvider");
  return ctx;
}
