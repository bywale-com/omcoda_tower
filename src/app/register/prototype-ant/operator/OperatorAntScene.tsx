/**
 * Operator desk — Ant Design translate with House-global / Per-tenancy / Support sider nav.
 */
import { useState, type ReactNode } from "react";
import { Layout, Menu, theme as antTheme } from "antd";
import {
  AppstoreOutlined,
  AuditOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  DollarOutlined,
  ExperimentOutlined,
  EyeOutlined,
  HeartOutlined,
  LinkOutlined,
  MailOutlined,
  NotificationOutlined,
  PlusSquareOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  OPERATOR_HOUSE_MODULES,
  OPERATOR_SUPPORT_MODULES,
  OPERATOR_TENANCY_MODULES,
} from "../../trace/surfaceCatalog";
import { OperatorNavProvider } from "../../prototype/operatorNav";
import { Surface } from "../chrome";
import { AcquisitionAdsModule } from "./AcquisitionAdsModule";
import { ActivationForwardDeployModule } from "./ActivationForwardDeployModule";
import { ActivationStateModule } from "./ActivationStateModule";
import { AuditTrailModule } from "./AuditTrailModule";
import { BookReadinessModule } from "./BookReadinessModule";
import { CommercialModule } from "./CommercialModule";
import { ConfigurationLibrariesModule } from "./ConfigurationLibrariesModule";
import { CustomerSupportModule } from "./CustomerSupportModule";
import { FirmHealthModule } from "./FirmHealthModule";
import { FirmOperationsBindModule } from "./FirmOperationsBindModule";
import { FounderAgencyControlsModule } from "./FounderAgencyControlsModule";
import { OversightModule } from "./OversightModule";
import { ProvisionModule } from "./ProvisionModule";
import { ReferenceDataModule } from "./ReferenceDataModule";
import { RegisterEvolutionModule } from "./RegisterEvolutionModule";
import { SendingInfrastructureModule } from "./SendingInfrastructureModule";
import { type ConfigLibSub } from "./operatorConfigLibraries";

const { Sider, Content } = Layout;

type ModuleId =
  | (typeof OPERATOR_HOUSE_MODULES)[number]
  | (typeof OPERATOR_TENANCY_MODULES)[number]
  | (typeof OPERATOR_SUPPORT_MODULES)[number];

const MODULE_ICON: Record<ModuleId, ReactNode> = {
  "Acquisition & ads": <NotificationOutlined />,
  "Activation & forward-deploy": <RocketOutlined />,
  "Reference data": <DatabaseOutlined />,
  "Configuration libraries": <AppstoreOutlined />,
  "Sending infrastructure": <MailOutlined />,
  "Oversight": <EyeOutlined />,
  "Audit trail": <AuditOutlined />,
  "Register & evolution": <ExperimentOutlined />,
  "Founder & agency controls": <SafetyCertificateOutlined />,
  Provision: <PlusSquareOutlined />,
  Commercial: <DollarOutlined />,
  "Firm operations bind": <LinkOutlined />,
  "Book readiness": <BookOutlined />,
  "Firm health": <HeartOutlined />,
  "Activation state": <ThunderboltOutlined />,
  "Customer support": <CustomerServiceOutlined />,
};

export function OperatorAntScene() {
  const { token } = antTheme.useToken();
  const [module, setModule] = useState<ModuleId>(OPERATOR_HOUSE_MODULES[0]);
  const [configSub, setConfigSub] = useState<ConfigLibSub>("Evaluation packs");

  const menuItems = [
    {
      type: "group" as const,
      label: "House-global",
      children: OPERATOR_HOUSE_MODULES.map((id) => ({
        key: id,
        icon: MODULE_ICON[id],
        label: id,
      })),
    },
    {
      type: "group" as const,
      label: "Per-tenancy",
      children: OPERATOR_TENANCY_MODULES.map((id) => ({
        key: id,
        icon: MODULE_ICON[id],
        label: id,
      })),
    },
    {
      type: "group" as const,
      label: "Support",
      children: OPERATOR_SUPPORT_MODULES.map((id) => ({
        key: id,
        icon: MODULE_ICON[id],
        label: id,
      })),
    },
  ];

  let main: ReactNode;
  switch (module) {
    case "Acquisition & ads":
      main = <AcquisitionAdsModule />;
      break;
    case "Activation & forward-deploy":
      main = <ActivationForwardDeployModule />;
      break;
    case "Reference data":
      main = <ReferenceDataModule />;
      break;
    case "Configuration libraries":
      main = <ConfigurationLibrariesModule sub={configSub} onSubChange={setConfigSub} />;
      break;
    case "Sending infrastructure":
      main = <SendingInfrastructureModule />;
      break;
    case "Oversight":
      main = <OversightModule />;
      break;
    case "Audit trail":
      main = <AuditTrailModule />;
      break;
    case "Register & evolution":
      main = <RegisterEvolutionModule />;
      break;
    case "Founder & agency controls":
      main = <FounderAgencyControlsModule />;
      break;
    case "Customer support":
      main = <CustomerSupportModule />;
      break;
    case "Provision":
      main = <ProvisionModule />;
      break;
    case "Commercial":
      main = <CommercialModule />;
      break;
    case "Firm operations bind":
      main = <FirmOperationsBindModule />;
      break;
    case "Book readiness":
      main = <BookReadinessModule />;
      break;
    case "Firm health":
      main = <FirmHealthModule />;
      break;
    case "Activation state":
      main = <ActivationStateModule />;
      break;
    default:
      main = null;
  }

  return (
    <OperatorNavProvider setModule={(id) => setModule(id as ModuleId)}>
    <Surface label="Operator desk">
      <Layout style={{ height: "100%", minHeight: 0, background: token.colorBgLayout }}>
        <Sider
          width={200}
          theme="light"
          style={{
            borderRight: `1px solid ${token.colorSplit}`,
            background: token.colorBgContainer,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[module]}
            items={menuItems}
            onClick={({ key }) => setModule(key as ModuleId)}
            style={{ borderInlineEnd: "none", height: "100%", overflow: "auto" }}
          />
        </Sider>
        {/* Inset lives on ModulePage (SPACING.md) — do not double-pad here. */}
        <Content style={{ minWidth: 0, minHeight: 0, padding: 0, overflow: "hidden" }}>
          {main}
        </Content>
      </Layout>
    </Surface>
    </OperatorNavProvider>
  );
}
