/**
 * Shared Ant composition chrome for Tower translate.
 * Surfaces stay addressable via data-register-surface for Register parity audits.
 */
import type { CSSProperties, ReactNode } from "react";
import { Space, Typography } from "antd";

const { Text, Title } = Typography;

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
}: {
  title: string;
  surface?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Surface label={surface ?? title} style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {extra ? <Space wrap>{extra}</Space> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
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
