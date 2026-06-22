import type { ReactNode } from "react";
import { composeViewHolonRoots, getRegisterView } from "../../components/docs/registerMeta";
import type { Tokens } from "../../components/tokens";
import { HolonComposerNode } from "./HolonComposerNode";

type RegisterViewComposerProps = {
  viewId: string;
  t: Tokens;
};

function LoginCardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="marketing-page"
      style={{
        minHeight: 0,
        background: "var(--paper)",
        color: "var(--ink)",
        fontSize: 16,
        padding: "20px 16px",
      }}
    >
      {children}
    </div>
  );
}

function BoardSidebarLayout({ t, children }: { t: Tokens; children: ReactNode }) {
  return (
    <div
      style={{
        background: t.boardPanel,
        borderTop: `1px solid ${t.borderLight}`,
      }}
    >
      {children}
    </div>
  );
}

export function RegisterViewComposer({ viewId, t }: RegisterViewComposerProps) {
  const view = getRegisterView(viewId);
  if (!view) {
    return <div style={{ padding: 12, fontSize: 12, color: t.textMuted }}>Unknown view: {viewId}</div>;
  }

  const roots = composeViewHolonRoots(viewId);
  const layoutProps = { ...view.layoutProps, t };

  const composed = roots.map((node) => (
    <HolonComposerNode
      key={node.meta.id}
      node={node}
      viewId={viewId}
      t={t}
      layoutProps={layoutProps}
    />
  ));

  if (view.layout === "login-card") {
    return <LoginCardLayout>{composed}</LoginCardLayout>;
  }

  return <BoardSidebarLayout t={t}>{composed}</BoardSidebarLayout>;
}
