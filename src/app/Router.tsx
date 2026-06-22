import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { LoginPage } from "./marketing/pages/LoginPage";
import { RegisterPage } from "./register/pages/RegisterPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <DocsRegistryProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DocsRegistryProvider>
    </BrowserRouter>
  );
}
