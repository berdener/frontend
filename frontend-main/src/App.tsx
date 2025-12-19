import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";

import Install from "./pages/Install";
import Dashboard from "./pages/Dashboard";
import QuickUpdate from "./pages/QuickUpdate";
import CSVUpdate from "./pages/CSVUpdate";

function getHostFromUrl(): string | null {
  // Shopify bazen host'u query'de, bazen hash içinde taşır
  const sp = new URLSearchParams(window.location.search || "");
  const hostFromSearch = sp.get("host");

  const hash = window.location.hash || "";
  let hostFromHash: string | null = null;

  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const hashQuery = hash.substring(qIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    hostFromHash = hashParams.get("host");
  }

  return hostFromSearch || hostFromHash;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Install />} />
        <Route path="/install" element={<Install />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quick" element={<QuickUpdate />} />
        <Route path="/csv" element={<CSVUpdate />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  const host = getHostFromUrl();

  // App Bridge config:
  // API key'i VITE_SHOPIFY_API_KEY olarak env'e koymanı öneririm.
  // (Dashboard'da zaten kullanıyorsan aynı key olmalı)
  const apiKey = (import.meta as any).env.VITE_SHOPIFY_API_KEY as string | undefined;

  // Embedded değilse (host yoksa) provider yine de çalışabilir ama Shopify özellikleri kısıtlı olur.
  // En azından crash etmesin diye guard koyuyoruz.
  if (!apiKey) {
    console.error("Missing VITE_SHOPIFY_API_KEY");
    return <AppRoutes />;
  }

  // host embedded yüklemede zorunlu; yoksa da AppRoutes'u göster (install ekranı dışarıdan da açılabilir)
  if (!host) {
    return <AppRoutes />;
  }

  const appBridgeConfig = {
    apiKey,
    host,
    forceRedirect: true,
  };

  return (
    <AppBridgeProvider config={appBridgeConfig}>
      <AppRoutes />
    </AppBridgeProvider>
  );
}
