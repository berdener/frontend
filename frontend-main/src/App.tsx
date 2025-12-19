import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";

import Install from "./pages/Install";
import Dashboard from "./pages/Dashboard";
import QuickUpdate from "./pages/QuickUpdate";
import CSVUpdate from "./pages/CSVUpdate";

function getParamsFromUrl() {
  const sp = new URLSearchParams(window.location.search || "");
  const shopFromSearch = sp.get("shop");
  const hostFromSearch = sp.get("host");

  const hash = window.location.hash || "";
  let shopFromHash: string | null = null;
  let hostFromHash: string | null = null;

  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const hashQuery = hash.substring(qIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    shopFromHash = hashParams.get("shop");
    hostFromHash = hashParams.get("host");
  }

  return {
    shop: shopFromSearch || shopFromHash,
    host: hostFromSearch || hostFromHash,
  };
}

function isEmbedded() {
  return window.top !== window.self;
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
  const { shop, host } = getParamsFromUrl();
  const embedded = isEmbedded();

  const apiKey = (import.meta as any).env.VITE_SHOPIFY_API_KEY as
    | string
    | undefined;

  // API key yoksa App Bridge çalışmaz; yine de routes’u göster.
  if (!apiKey) {
    console.error("Missing VITE_SHOPIFY_API_KEY");
    return <AppRoutes />;
  }

  /**
   * Kritik stabilizasyon:
   * Embedded içindeysek ama host yoksa, App Bridge INVALID_ORIGIN verir.
   * Bu durumda Shopify Admin’e (top window) aynı rota ile geri yönlendiriyoruz;
   * Shopify URL’ye host’u tekrar ekleyerek geri açar.
   */
  if (embedded && !host) {
    // Loop engelle
    const lockKey = "stockpilot_missing_host_reload_v1";
    if (sessionStorage.getItem(lockKey) !== "1") {
      sessionStorage.setItem(lockKey, "1");

      // Shopify admin içinden açıldığı için, en güvenli yöntem:
      // Top window'u mevcut URL'ye tekrar yönlendir.
      // Shopify, embedded app URL’yi host ile tekrar kurar.
      try {
        window.top?.location?.replace(window.location.href);
      } catch {
        // Fallback
        window.location.replace(window.location.href);
      }
    }

    return <AppRoutes />;
  }

  // Embedded değilse veya host yoksa: Provider kurmadan devam (Install ekranı dışarıdan açılabilir)
  if (!host) return <AppRoutes />;

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
