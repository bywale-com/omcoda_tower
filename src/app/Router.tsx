import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { isRegisterRouteEnabled } from "./auth/authClient";
import { AuthGate } from "./auth/AuthGate";
import { AuthProvider } from "./auth/AuthContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";

export function AppRouter() {
  const registerEnabled = isRegisterRouteEnabled();

  return (
    <BrowserRouter>
      <AuthProvider>
        <DocsRegistryProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {registerEnabled ? <Route path="/register" element={<RegisterPage />} /> : null}
            <Route
              path="/"
              element={
                <AuthGate>
                  <App />
                </AuthGate>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DocsRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
