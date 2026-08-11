import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { isAuthDisabled } from "./auth/authClient";
import { AuthGate } from "./auth/AuthGate";
import { AuthProvider } from "./auth/AuthContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";
import { SystemMapPage } from "./system-map/SystemMapPage";

/** Hub (legacy app) — engagement Activity / client look-inside live here until CT parity. */
function HubApp() {
  const authOff = isAuthDisabled();
  if (authOff) return <App />;
  return (
    <AuthGate>
      <App />
    </AuthGate>
  );
}

export function AppRouter() {
  const authOff = isAuthDisabled();

  return (
    <BrowserRouter>
      <AuthProvider>
        <DocsRegistryProvider>
          <Routes>
            <Route
              path="/login"
              element={authOff ? <Navigate to="/" replace /> : <LoginPage />}
            />
            {/* Always declare /register so a missing env flag cannot silently
                fall through to "*" → Board. RegisterPage itself Navigates home
                when the route is intentionally disabled. */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/Register" element={<Navigate to="/register" replace />} />
            {/* Machine System Map — isolated from Tower faces / prototype */}
            <Route path="/system-map" element={<SystemMapPage />} />
            {/*
              Product face = CT Ant (separate MPA at /prototype-ant).
              Hub stays loadable for engagement-UI reference — do not steal /hub or
              /activity into the CT redirect (that made the old app unreachable).
            */}
            <Route path="/" element={<Navigate to="/prototype-ant" replace />} />
            <Route path="/hub" element={<HubApp />} />
            <Route path="/hub/*" element={<HubApp />} />
            {/* Hub Activity is in-app tabs; /activity must still mount Hub, not CT. */}
            <Route path="/activity" element={<HubApp />} />
            <Route path="/activity/*" element={<HubApp />} />
            <Route path="*" element={<Navigate to="/prototype-ant" replace />} />
          </Routes>
        </DocsRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
