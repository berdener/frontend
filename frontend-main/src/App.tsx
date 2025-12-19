import { useEffect, useMemo, useState } from "react";
import { Provider } from "@shopify/app-bridge-react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Install from "./pages/Install"; // Install sayfanın yolu

// Eğer başka sayfaların varsa buraya import et
// import Dashboard from "./pages/Dashboard";

function App() {
  // URL'den host ve shop parametrelerini alıyoruz
  const [config, setConfig] = useState<{
    host: string;
    apiKey: string;
    forceRedirect: boolean;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    
    // Shopify API Key'ini .env dosyasından alıyoruz
    const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;

    if (host && apiKey) {
      setConfig({
        host,
        apiKey,
        forceRedirect: true, // Uygulamayı Shopify içinde tutmaya zorlar
      });
    }
  }, []);

  // Eğer host parametresi yoksa (uygulama direkt tarayıcıdan açıldıysa)
  // Provider olmadan render ediyoruz.
  if (!config) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/install" element={<InstallWithoutProvider />} />
          {/* Diğer route'lar buraya */}
          <Route path="*" element={<InstallWithoutProvider />} /> 
        </Routes>
      </BrowserRouter>
    );
  }

  // Host varsa App Bridge Provider ile sarmalıyoruz
  return (
    <Provider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Install />} />
          <Route path="/install" element={<Install />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

// App Bridge Context'i olmadan Install sayfasını render etmek için wrapper
// Bu, useAppBridge hatasını önler (eğer dışarıdan açılırsa)
function InstallWithoutProvider() {
  return <Install />;
}

export default App;
