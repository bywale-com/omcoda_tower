/**
 * Tower CT Ant shell — product face.
 * Admin (admin@try-tower.com): Consultant ▾ | Operator | Contact
 * Everyone else: consultant workspace only (no switcher).
 * Prototype (auth bypass) keeps the full admin-shaped shell for modeling.
 */
import { useEffect, useMemo, useState } from "react";
import {
  App,
  ConfigProvider,
  Dropdown,
  Layout,
  Segmented,
  Space,
  Switch,
  Typography,
  theme as antTheme,
} from "antd";
import {
  BulbOutlined,
  ControlOutlined,
  DownOutlined,
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../auth/AuthContext";
import { isAuthDisabled } from "../../auth/authClient";
import { isPlatformAdminEmail } from "../../auth/platformAdmin";
import { buildTowerAntTheme, loadAntThemeMode, saveAntThemeMode, type AntThemeMode } from "./theme";
import { ConsultantAntScene } from "./consultant/ConsultantAntScene";
import { OperatorAntScene } from "./operator/OperatorAntScene";
import { ContactAntScene } from "./contact/ContactAntScene";
import { LoginModule } from "./consultant/LoginModule";
import { ViewAsProvider, useViewAs } from "./viewAsContext";

const { Header, Content } = Layout;
const { Text } = Typography;

export type AntDesk = "consultant" | "operator" | "contact";

export function PrototypeAntApp() {
  const [mode, setMode] = useState<AntThemeMode>(() => loadAntThemeMode());
  const themeConfig = useMemo(() => buildTowerAntTheme(mode), [mode]);

  return (
    <ConfigProvider theme={themeConfig}>
      <App style={{ height: "100%" }}>
        <ViewAsProvider>
          <AntShell
            mode={mode}
            onMode={(m) => {
              setMode(m);
              saveAntThemeMode(m);
            }}
          />
        </ViewAsProvider>
      </App>
    </ConfigProvider>
  );
}

function AntShell({
  mode,
  onMode,
}: {
  mode: AntThemeMode;
  onMode: (m: AntThemeMode) => void;
}) {
  const { token } = antTheme.useToken();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isAdmin, consultants, selected, selectConsultant, loading: consultantsLoading } =
    useViewAs();
  const [desk, setDesk] = useState<AntDesk>("consultant");

  // Non-admin never leaves consultant desk.
  useEffect(() => {
    if (!isAdmin && desk !== "consultant") setDesk("consultant");
  }, [isAdmin, desk]);

  const authOff = isAuthDisabled();
  const needsLogin = !authOff && !isLoading && !isAuthenticated;

  const consultantLabel = selected
    ? `${selected.firmName}`
    : consultantsLoading
      ? "Consultants…"
      : "Consultant";

  const consultantMenuItems = consultants.map((c) => ({
    key: c.firmId,
    label: (
      <div>
        <div>{c.firmName}</div>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {c.email}
        </Text>
      </div>
    ),
    onClick: () => {
      selectConsultant(c.firmId);
      setDesk("consultant");
    },
  }));

  const segmentedOptions = isAdmin
    ? [
        {
          label: (
            <Dropdown
              menu={{ items: consultantMenuItems, selectable: true, selectedKeys: selected ? [selected.firmId] : [] }}
              trigger={["click"]}
              disabled={!consultants.length}
            >
              <span
                onClick={(e) => {
                  // Keep Segmented on consultant; open dropdown instead of only switching desk.
                  e.stopPropagation();
                  setDesk("consultant");
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <UserOutlined />
                <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {consultantLabel}
                </span>
                <DownOutlined style={{ fontSize: 10 }} />
              </span>
            </Dropdown>
          ),
          value: "consultant",
        },
        { label: "Operator", value: "operator", icon: <ControlOutlined /> },
        { label: "Contact", value: "contact", icon: <TeamOutlined /> },
      ]
    : [{ label: "Consultant", value: "consultant", icon: <UserOutlined /> }];

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
        <Space size="middle" wrap>
          <Text strong style={{ fontSize: 16 }}>
            Tower
          </Text>
          {authOff ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Prototype · Ant Design
            </Text>
          ) : isPlatformAdminEmail(user?.email) ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Admin
            </Text>
          ) : user?.email ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Text>
          ) : null}
          {!needsLogin ? (
            <Segmented
              value={desk}
              onChange={(v) => {
                const next = v as AntDesk;
                if (!isAdmin && next !== "consultant") return;
                setDesk(next);
              }}
              options={segmentedOptions}
            />
          ) : null}
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
          <a href="/hub" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LinkOutlined />
            Hub
          </a>
          <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LinkOutlined />
            Source plant
          </a>
        </Space>
      </Header>
      <Content style={{ height: "calc(100% - 56px)", overflow: "hidden", background: token.colorBgLayout }}>
        {isLoading && !authOff ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>
        ) : needsLogin ? (
          <LoginModule />
        ) : desk === "operator" && isAdmin ? (
          <OperatorAntScene />
        ) : desk === "contact" && isAdmin ? (
          <ContactAntScene />
        ) : (
          <ConsultantAntScene />
        )}
      </Content>
    </Layout>
  );
}
