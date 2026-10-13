import { Layout} from "antd";

export function OperatorAntScene() {
  const title = "Operator Desk Reconstruction and addition.";
  const version = 1;
  return (
    < Layout style={{ height: "100%", padding: "24"}}>
      <p>Version {version + 1} </p>
      <h1>{title} </h1>
      <p>Navigation and layout loading next...</p>
    </Layout>  
  )
}