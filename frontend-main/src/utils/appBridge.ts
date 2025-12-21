import { createApp } from "@shopify/app-bridge";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";

let app: any = null;

function getParam(name: string) {
  const sp = new URLSearchParams(window.location.search || "");
  if (sp.get(name)) return sp.get(name);

  const hash = window.location.hash || "";
  const i = hash.indexOf("?");
  if (i !== -1) {
    const hp = new URLSearchParams(hash.substring(i + 1));
    if (hp.get(name)) return hp.get(name);
  }

  return sessionStorage.getItem(`sp_${name}`);
}

function ensureContext() {
  const shop = getParam("shop");
  let host = getParam("host");

  if (shop && !host) {
    const handle = shop.replace(".myshopify.com", "");
    host = btoa(`admin.shopify.com/store/${handle}`);
  }

  if (shop) sessionStorage.setItem("sp_shop", shop);
  if (host) sessionStorage.setItem("sp_host", host);

  return { shop, host };
}

export function getAppBridge() {
  if (app) return app;

  const { shop, host } = ensureContext();
  if (!shop || !host) return null;

  app = createApp({
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return app;
}

export async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const app = getAppBridge();
  if (!app) return fetch(input, init);
  return authenticatedFetch(app)(input, init);
}
