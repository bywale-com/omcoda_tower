/**
 * Tower CT Ant shell — product face.
 * Operator / modeling: Consultant ▾ | Operator | Contact ▾. No leftover firm chip.
 * Consultant person: Consultant only. Contact person (/c/<token>): no this switcher.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  App,
  Button,
  ConfigProvider,
  Dropdown,
  Empty,
  Layout,
  Space,
  Switch,
  Typography,
  theme as antTheme,
} from "antd";
import {
  BankOutlined,
  BulbOutlined,
  DownOutlined,
  LinkOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./antFill.css";
import { useAuth } from "../../auth/AuthContext";
import { isAuthDisabled } from "../../auth/authClient";
import { isPlatformAdminEmail } from "../../auth/platformAdmin";
import { buildTowerAntTheme, loadAntThemeMode, saveAntThemeMode, type AntThemeMode } from "./theme";
import { ConsultantAntScene } from "./consultant/ConsultantAntScene";
import { OperatorAntScene } from "./operator/OperatorAntScene";
import { ContactAntScene, ContactWorkspace } from "./contact/ContactWorkspace";
import { LoginModule } from "./consultant/LoginModule";
import { ViewAsProvider, useViewAs } from "./viewAsContext";

const { Header, Content } = Layout;
const { Text } = Typography;

type AntDesk = "consultant" | "operator" | "contact";

function contactTokenFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/c\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function Slot({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { token } = antTheme.useToken();
  const style: CSSProperties = {
    appearance: "none",
    border: "none",
    background: active ? token.colorBgContainer : "transparent",
    boxShadow: active ? token.boxShadowTertiary : undefined,
    borderRadius: token.borderRadiusSM,
    padding: "4px 11px",
    cursor: "pointer",
    fontWeight: 500,
    color: token.colorText,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    lineHeight: "22px",
  };
  return (
    <button type="button" style={style} onClick={onClick}>
      {children}
    </button>
  );
}

export function PrototypeAntApp() {
  const [mode, setMode] = useState<AntThemeMode>(() => loadAntThemeMode());
  const themeConfig = useMemo(() => buildTowerAntTheme(mode), [mode]);
  const seatToken = contactTokenFromPath();

  if (seatToken) {
    return (
      <ConfigProvider theme={themeConfig}>
        <App style={{ height: "100%" }}>
          <ContactWorkspace token={seatToken} />
        </App>
      </ConfigProvider>
    );
  }

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
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const {
    isAdmin,
    consultants,
    selected,
    selectConsultant,
    contactWorkspaces,
    selectedContact,
    selectContact,
    loading: consultantsLoading,
  } = useViewAs();
  const [desk, setDesk] = useState<AntDesk>("consultant");

  useEffect(() => {
    if (!isAdmin && desk !== "consultant") setDesk("consultant");
  }, [isAdmin, desk]);

  const authOff = isAuthDisabled();
  const needsLogin = !isLoading && !isAuthenticated;

  const consultantMenuItems = consultants.map((c) => ({
    key: c.firmId,
    icon: <BankOutlined />,
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

  const contactMenuItems = contactWorkspaces.map((row) => ({
    key: row.id,
    icon: <TeamOutlined />,
    label: (
      <div>
        <div>{row.name || row.id}</div>
        {row.email ? (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {row.email}
          </Text>
        ) : null}
      </div>
    ),
    onClick: () => {
      selectContact(row.id);
      setDesk("contact");
    },
  }));

  const track: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: 2,
    background: token.colorFillTertiary,
    borderRadius: token.borderRadius,
  };

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
          {!needsLogin && isAdmin ? (
            <div style={track} role="tablist" aria-label="Desk">
              <Dropdown
                menu={{
                  items: consultantMenuItems,
                  selectable: true,
                  selectedKeys: selected ? [selected.firmId] : [],
                }}
                trigger={["click"]}
                disabled={!consultants.length && !consultantsLoading}
              >
                <span>
                  <Slot active={desk === "consultant"} onClick={() => setDesk("consultant")}>
                    <UserOutlined />
                    Consultant
                    <DownOutlined style={{ fontSize: 10 }} />
                  </Slot>
                </span>
              </Dropdown>
              <Slot active={desk === "operator"} onClick={() => setDesk("operator")}>
                Operator
              </Slot>
              <Dropdown
                menu={{
                  items: contactMenuItems.length
                    ? contactMenuItems
                    : [{ key: "empty", label: "No contact workspaces", disabled: true }],
                  selectable: true,
                  selectedKeys: selectedContact ? [selectedContact.id] : [],
                }}
                trigger={["click"]}
              >
                <span>
                  <Slot
                    active={desk === "contact"}
                    onClick={() => {
                      if (selectedContact) setDesk("contact");
                    }}
                  >
                    Contact
                    <DownOutlined style={{ fontSize: 10 }} />
                  </Slot>
                </span>
              </Dropdown>
            </div>
          ) : !needsLogin ? (
            <div style={track}>
              <Slot active onClick={() => setDesk("consultant")}>
                Consultant
              </Slot>
            </div>
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
          {!needsLogin ? (
            <Button type="text" icon={<LogoutOutlined />} onClick={() => void logout()}>
              Log out
            </Button>
          ) : null}
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
          selectedContact ? (
            <ContactAntScene contactId={selectedContact.id} />
          ) : (
            <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Empty description="No contact workspace selected." />
            </div>
          )
        ) : (
          <ConsultantAntScene key={selected?.firmId ?? user?.firmId ?? "self"} />
        )}
      </Content>
    </Layout>
  );
}
