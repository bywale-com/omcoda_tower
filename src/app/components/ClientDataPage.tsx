import { ClientDataContent } from "./DataPanel";
import type { Tokens } from "./tokens";

type ClientDataPageProps = {
  clientId: string;
  t: Tokens;
  isDark: boolean;
};

export function ClientDataPage({ clientId, t, isDark }: ClientDataPageProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minWidth: 0,
      background: t.bgPrimary,
      overflow: "hidden",
    }}>
      <ClientDataContent
        clientId={clientId}
        t={t}
        isDark={isDark}
        defaultTab="logs"
        fullPage
      />
    </div>
  );
}
