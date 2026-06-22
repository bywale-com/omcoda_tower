
import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/Router.tsx";
import "./styles/index.css";
import "./styles/omcoda-marketing.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
  