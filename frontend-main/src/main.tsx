import { ensureShopHost } from "./lib/shopifyParams";
ensureShopHost();
import "@shopify/polaris/build/esm/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "@shopify/polaris";
import tr from "@shopify/polaris/locales/tr.json";

import App from "./App";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider i18n={tr}>
      <App />
    </AppProvider>
  </React.StrictMode>
);
