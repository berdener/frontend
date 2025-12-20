import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";

import Install from "./pages/Install";
import Dashboard from "./pages/Dashboard";
import QuickUpdate from "./pages/QuickUpdate";
import CSVUpdate from "./pages/CSVUpdate";

// URL'den parametreleri güvenli şekilde ayıklar
function getParamsFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.split("?")[1];
  const hashParams = new URLSearchParams(hash || "");

  return {
    shop: searchParams.get("shop") || hashParams.get("shop"),
    host: searchParams.get("host") || hashParams.get("host"),
  };
}

function AppRoutes() {
  return (
    <Router>
      <ParamPreserver /> {/* URL parametrelerini koruyan gizli bileşen */}
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

// BU YENİ: Sayfa geçişlerinde host parametresinin kaybolmasını önler
function ParamPreserver() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { host, shop } = getParamsFromUrl();
    if (host && shop) {
      const currentParams = new URLSearchParams(location.search);
      if (!currentParams.has("host")) {
        // Eğer URL'de host yoksa ama bizde varsa, URL'ye ekle
        navigate(`${location.pathname}?shop=${shop}&host=${host}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  const { host } = getParamsFromUrl();
  const apiKey = (import.meta as any).env.VITE_SHOPIFY_API_KEY;

  if (!apiKey) {
    return <div style={{padding: 20, color: 'red'}}>Hata: .env dosyasında VITE_SHOPIFY_API_KEY eksik!</div>;
  }

  // Config varsa Provider ile başlat
  if (host) {
    const config = {
      apiKey,
      host,
      forceRedirect: true,
    };

    return (
      <AppBridgeProvider config={config}>
        <AppRoutes />
      </AppBridgeProvider>
    );
  }

  // Host yoksa (örn: Install ekranı dışarıdan açıldıysa) Providersız devam et
  return <AppRoutes />;
}
