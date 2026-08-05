import { useCallback, useState, type ReactNode } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  CalendarOutlined,
  ContactsOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { getContact } from "../../../data/contacts";
import { Surface } from "../chrome";
import { BoardModule } from "./BoardModule";
import { ContactsModule } from "./ContactsModule";
import { buildHaltRetention, HaltOutreachModal } from "./HaltOutreachModal";
import { LoginModule } from "./LoginModule";
import { MeetingsModule } from "./MeetingsModule";
import { PreparedModule } from "./PreparedModule";
import {
  DEFAULT_LICENSEE,
  FIRM_NAME,
  nowStamp,
  type ConsultantModule,
  type HaltRetention,
  type HaltScope,
} from "./shared";

const { Sider, Content } = Layout;
const { Text } = Typography;

const MENU_ITEMS: { key: ConsultantModule; icon: ReactNode; label: string }[] = [
  { key: "Board", icon: <DashboardOutlined />, label: "Board" },
  { key: "Contacts", icon: <ContactsOutlined />, label: "Contacts" },
  { key: "Meetings", icon: <CalendarOutlined />, label: "Meetings" },
  { key: "Prepared Workspace", icon: <FileTextOutlined />, label: "Prepared Workspace" },
  { key: "Login", icon: <LoginOutlined />, label: "Login" },
];

function contactListHasClient(id: string): boolean {
  return Boolean(getContact(id)?.clientId) ||
    ["sarah", "marcus", "mark", "aisha", "priya", "james", "daniel", "fatima", "lin"].includes(id);
}

export function ConsultantAntScene() {
  const [module, setModule] = useState<ConsultantModule>("Board");
  const [activeClientId, setActiveClientId] = useState("sarah");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [bookHalted, setBookHalted] = useState(false);
  const [bookHalt, setBookHalt] = useState<HaltRetention | null>(null);
  const [haltByContact, setHaltByContact] = useState<Record<string, HaltRetention>>({});
  const [activityKick, setActivityKick] = useState(0);
  const [haltModalOpen, setHaltModalOpen] = useState(false);
  const [haltScope, setHaltScope] = useState<HaltScope>("contact");
  const [haltReason, setHaltReason] = useState("");
  const [meetingsSelectId, setMeetingsSelectId] = useState<string | null>(null);
  const [bookAuthorized, setBookAuthorized] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licensee, setLicensee] = useState(DEFAULT_LICENSEE);
  const [forceAcceptOpen, setForceAcceptOpen] = useState(false);

  const onHardInputChange = useCallback(
    (state: { bookAuthorized: boolean; termsAccepted: boolean; licensee: string }) => {
      setBookAuthorized(state.bookAuthorized);
      setTermsAccepted(state.termsAccepted);
      setLicensee(state.licensee);
    },
    [],
  );

  function confirmHalt() {
    const retention = buildHaltRetention(haltScope, haltReason);
    retention.at = nowStamp();
    if (haltScope === "book") {
      setBookHalted(true);
      setBookHalt(retention);
    } else {
      setHaltByContact((prev) => ({ ...prev, [activeClientId]: retention }));
    }
    setHaltModalOpen(false);
    setHaltReason("");
  }

  function liftHaltForActive() {
    if (bookHalted || bookHalt) {
      setBookHalted(false);
      setBookHalt(null);
    }
    setHaltByContact((prev) => {
      const next = { ...prev };
      delete next[activeClientId];
      return next;
    });
  }

  function openHaltModal(clientId?: string) {
    if (clientId) setActiveClientId(clientId);
    setHaltModalOpen(true);
  }

  function openAcceptedTerms() {
    setForceAcceptOpen(true);
    setModule("Prepared Workspace");
    window.setTimeout(() => setForceAcceptOpen(false), 100);
  }

  function handleContactClick(contactId: string) {
    setActiveContactId(contactId);
    const contact = getContact(contactId);
    const clientId = contact?.clientId ?? (contactListHasClient(contactId) ? contactId : null);
    if (clientId) setActiveClientId(clientId);
  }

  const workspaceClientId =
    module === "Contacts" && activeContactId && contactListHasClient(activeContactId)
      ? getContact(activeContactId)?.clientId ?? activeContactId
      : activeClientId;

  return (
    <Layout style={{ height: "100%", minHeight: 0 }}>
      <Sider width={168} theme="light" style={{ borderRight: "1px solid var(--ant-color-split)" }}>
        <Surface label="Primary navigation">
          <div style={{ padding: "12px 16px 8px" }}>
            <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase" }}>
              Firm desk
            </Text>
            <div style={{ fontWeight: 700, marginTop: 4 }} title="Firm identity in shell">
              {FIRM_NAME}
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[module]}
            onClick={({ key }) => setModule(key as ConsultantModule)}
            items={MENU_ITEMS.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          />
        </Surface>
      </Sider>

      <Content style={{ minHeight: 0, overflow: "hidden" }}>
        {module === "Board" ? (
          <BoardModule
            activeClientId={activeClientId}
            onClientSelect={(id) => {
              setActiveClientId(id);
              setModule("Board");
            }}
            haltByContact={haltByContact}
            bookHalt={bookHalt}
            bookHalted={bookHalted}
            licenseeLabel={licensee}
            bookAuthorized={bookAuthorized}
            termsAccepted={termsAccepted}
            activityKick={activityKick}
            onHaltOutreach={() => openHaltModal(workspaceClientId)}
            onLiftHalt={liftHaltForActive}
            onHaltBook={() => openHaltModal()}
            onResumeBook={() => {
              setBookHalted(false);
              setBookHalt(null);
            }}
            onMeetingClick={(id) => {
              setMeetingsSelectId(id);
              setModule("Meetings");
            }}
            onSeeAllMeetings={() => {
              setMeetingsSelectId(null);
              setModule("Meetings");
            }}
            onOpenAcceptedTerms={termsAccepted ? openAcceptedTerms : undefined}
          />
        ) : null}

        {module === "Contacts" ? (
          <ContactsModule
            activeContactId={activeContactId}
            onContactSelect={handleContactClick}
            haltByContact={haltByContact}
            bookHalt={bookHalt}
            licenseeLabel={licensee}
            termsAccepted={termsAccepted}
            activityKick={activityKick}
            workspaceClientId={workspaceClientId}
            onHaltOutreach={() => openHaltModal(workspaceClientId)}
            onLiftHalt={liftHaltForActive}
            onOpenAcceptedTerms={termsAccepted ? openAcceptedTerms : undefined}
          />
        ) : null}

        {module === "Meetings" ? (
          <MeetingsModule
            initialSelectedId={meetingsSelectId}
            onBackToBoard={() => setModule("Board")}
          />
        ) : null}

        {module === "Prepared Workspace" ? (
          <PreparedModule
            forceAcceptOpen={forceAcceptOpen}
            onHardInputChange={onHardInputChange}
          />
        ) : null}

        {module === "Login" ? (
          <LoginModule onVerified={() => setModule("Board")} />
        ) : null}
      </Content>

      <HaltOutreachModal
        open={haltModalOpen}
        scope={haltScope}
        reason={haltReason}
        onScope={setHaltScope}
        onReason={setHaltReason}
        onConfirm={confirmHalt}
        onClose={() => setHaltModalOpen(false)}
      />
    </Layout>
  );
}
