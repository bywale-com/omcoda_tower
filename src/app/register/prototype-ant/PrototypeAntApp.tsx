/**
 * Isolated Ant Design whole-product shell for Tower Register plant translate.
 * Cross-link to source plant is full-document navigation only.
 */
import { useMemo, useState } from "react";
import {
  App,
  ConfigProvider,
  Layout,
  Segmented,
  Space,
  Switch,
  Typography,
  theme as antTheme,
} from "antd";
import {
  BulbOutlined,
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { buildTowerAntTheme, loadAntThemeMode, saveAntThemeMode, type AntThemeMode } from "./theme";
import { ConsultantAntScene } from "./consultant/ConsultantAntScene";
import { OperatorAntScene } from "./operator/OperatorAntScene";
import { ContactAntScene } from "./contact/ContactAntScene";

const { Header, Content } = Layout;
const { Text } = Typography;

export type AntDesk = "consultant" | "operator" | "contact";

export function PrototypeAntApp() {
  const [mode, setMode] = useState<AntThemeMode>(() => loadAntThemeMode());
  const [desk, setDesk] = useState<AntDesk>("consultant");
  const themeConfig = useMemo(() => buildTowerAntTheme(mode), [mode]);
  const { token } = antTheme.useToken();

  return (
    <ConfigProvider theme={themeConfig}>
      <App style={{ height: "100%" }}>
        <AntShell
          desk={desk}
          onDesk={setDesk}
          mode={mode}
          onMode={(m) => {
            setMode(m);
            saveAntThemeMode(m);
          }}
        />
      </App>
    </ConfigProvider>
  );
}

function AntShell({
  desk,
  onDesk,
  mode,
  onMode,
}: {
  desk: AntDesk;
  onDesk: (d: AntDesk) => void;
  mode: AntThemeMode;
  onMode: (m: AntThemeMode) => void;
}) {
  const { token } = antTheme.useToken();

  return (
    <Layout style={{ height: "100%", minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorSplit}`,
          paddingInline: 20,
        }}
      >
        <Space size="middle">
          <Text strong style={{ fontSize: 16 }}>
            Tower
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Prototype · Ant Design
          </Text>
          <Segmented
            value={desk}
            onChange={(v) => onDesk(v as AntDesk)}
            options={[
              { label: "Consultant", value: "consultant", icon: <UserOutlined /> },
              { label: "Operator", value: "operator", icon: <ControlOutlined /> },
              { label: "Contact", value: "contact", icon: <TeamOutlined /> },
            ]}
          />
        </Space>
        <Space size="middle">
          <Space size={6}>
            <BulbOutlined />
            <Switch
              size="small"
              checked={mode === "dark"}
              onChange={(checked) => onMode(checked ? "dark" : "light")}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </Space>
          {/* Full document nav — never in-SPA across CSS worlds */}
          <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LinkOutlined />
            Source plant
          </a>
        </Space>
      </Header>
      <Content style={{ height: "calc(100% - 56px)", overflow: "hidden", background: token.colorBgLayout }}>
        {desk === "operator" ? (
          <OperatorAntScene />
        ) : desk === "contact" ? (
          <ContactAntScene />
        ) : (
          <ConsultantAntScene />
        )}
      </Content>
    </Layout>
  );
}
