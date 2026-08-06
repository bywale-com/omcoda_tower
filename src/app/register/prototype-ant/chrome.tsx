/**
 * Shared Ant composition chrome for Tower translate.
 * Surfaces stay addressable via data-register-surface for Register parity audits.
 *
 * Spacing law (see SPACING.md): ModulePage owns content inset so titles/controls
 * never sit flush against panel or split borders. Prefer token paddingMD (16).
 */
import type { CSSProperties, ReactNode } from "react";
import { Space, Typography, theme } from "antd";

const { Text, Title } = Typography;

/** Default content inset — Ant paddingMD. Do not go below this for ModulePage. */
export const MODULE_PAGE_INSET = 16;

export function Surface({
  label,
  children,
  style,
}: {
  label: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div data-register-surface={label} style={style}>
      {children}
    </div>
  );
}

export function ModulePage({
  title,
  surface,
  extra,
  children,
  /** Override inset; default MODULE_PAGE_INSET (16). Use 0 only for true full-bleed shells. */
  inset = MODULE_PAGE_INSET,
}: {
  title: string;
  surface?: string;
  extra?: ReactNode;
  children: ReactNode;
  inset?: number;
}) {
  const { token } = theme.useToken();
  const pad = inset;

  return (
    <Surface
      label={surface ?? title}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: token.colorBgContainer,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
          padding: `${pad}px ${pad}px 12px`,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {extra ? <Space wrap>{extra}</Space> : null}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: `0 ${pad}px ${pad}px`,
        }}
      >
        {children}
      </div>
    </Surface>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
      {children}
    </Text>
  );
}
