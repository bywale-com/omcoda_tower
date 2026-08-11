/**
 * Isolated Ant Design translate entry.
 * Must never be imported from main.tsx / AppRouter — protects source plant CSS.
 */
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/auth/AuthContext";
import { PrototypeAntApp } from "./app/register/prototype-ant/PrototypeAntApp";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <PrototypeAntApp />
  </AuthProvider>,
);
