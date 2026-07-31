import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { isAuthDisabled } from "./auth/authClient";
import { AuthGate } from "./auth/AuthGate";
import { AuthProvider } from "./auth/AuthContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";

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
