import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { isAuthDisabled } from "./auth/authClient";
import { AuthGate } from "./auth/AuthGate";
import { AuthProvider } from "./auth/AuthContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";
import { SystemMapPage } from "./system-map/SystemMapPage";

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
            {/* Product face = CT prototype (Ant). Hub quarantined at /hub — not the default entry. */}
            <Route path="/" element={<Navigate to="/prototype-ant" replace />} />
            <Route
              path="/hub"
              element={
                authOff ? (
                  <App />
                ) : (
                  <AuthGate>
                    <App />
                  </AuthGate>
                )
              }
            />
            <Route path="*" element={<Navigate to="/prototype-ant" replace />} />
          </Routes>
        </DocsRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
