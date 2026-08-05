/**
 * Ant Design click-through host — embeds translate scenes inside Register CT.
 * No product header/persona Segmented here: CT chrome owns desk tabs + DS toggle.
 * ConfigProvider mounts only while Ant mode is active (unmounted on DS-I).
 */
import { useMemo } from "react";
import { App, ConfigProvider } from "antd";
import type { CtDeskId } from "../context/RegisterShellContext";
import { ConsultantAntScene } from "./consultant/ConsultantAntScene";
import { ContactAntScene } from "./contact/ContactAntScene";
import { OperatorAntScene } from "./operator/OperatorAntScene";
import { buildTowerAntTheme } from "./theme";

export function AntCtHost({ desk, isDark }: { desk: CtDeskId; isDark: boolean }) {
  const themeConfig = useMemo(
    () => buildTowerAntTheme(isDark ? "dark" : "light"),
    [isDark],
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <App
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex" }}>
          {desk === "operator" ? (
            <OperatorAntScene />
          ) : desk === "contact" ? (
            <ContactAntScene />
          ) : (
            <ConsultantAntScene />
          )}
        </div>
      </App>
    </ConfigProvider>
  );
}
