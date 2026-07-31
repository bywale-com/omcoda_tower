import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { isAuthDisabled, isRegisterRouteEnabled } from "./auth/authClient";
import { AuthGate } from "./auth/AuthGate";
import { AuthProvider } from "./auth/AuthContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";

export function AppRouter() {
  const registerEnabled = isRegisterRouteEnabled();
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
            {registerEnabled ? <Route path="/register" element={<RegisterPage />} /> : null}
            <Route
              path="/"
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DocsRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
