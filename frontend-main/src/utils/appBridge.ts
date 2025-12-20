import { createApp } from "@shopify/app-bridge";
import {
  authenticatedFetch,
  getSessionToken,
} from "@shopify/app-bridge/utilities";
import { ensureShopHost } from "../lib/shopifyParams"; 

/**
 * Shopify Admin bazen `shop` ve `host` parametrelerini querystring'de,
 * bazen de hash router kullanan SPA'larda (#/route?... ) hash içinde taşır.
 */
function getParamsFromUrl() {
  // Storage’da shop/host’u garanti altına alır (host yoksa üretir)
  const { shop: shopFromStorage, host: hostFromStorage } = ensureShopHost();

  const searchParams = new URLSearchParams(window.location.search || "");
  const shopFromSearch = searchParams.get("shop");
  const hostFromSearch = searchParams.get("host");

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

  const shop = shopFromSearch || shopFromHash || shopFromStorage;
  const host = hostFromSearch || hostFromHash || hostFromStorage;

  return { shop, host };
}


declare global {
  interface Window {
    __STOCKPILOT_APP_BRIDGE__?: ReturnType<typeof createApp>;
    __STOCKPILOT_AUTH_FETCH__?: ReturnType<typeof authenticatedFetch>;
  }
}

export function getAppBridge() {
  if (typeof window === "undefined") return null;

  const { shop, host } = getParamsFromUrl();
 const isEmbedded = window.top !== window.self;

if (!isEmbedded) {
  console.warn(
    "[StockPilot] Embedded değil; App Bridge yine de başlatılacak ve forceRedirect ile Shopify Admin içine taşınacak."
  );
  // return yok
}


  if (!shop || !host) {
    console.warn("[StockPilot] App Bridge devre dışı (shop/host yok).", {
      shop,
      host,
    });
    return null;
  }

  if (window.__STOCKPILOT_APP_BRIDGE__) return window.__STOCKPILOT_APP_BRIDGE__;

  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY as string | undefined;
  if (!apiKey) {
    console.error("[StockPilot] VITE_SHOPIFY_API_KEY tanımlı değil.");
    return null;
  }

  // App Bridge Next bazı senaryolarda `shop` alanını da ister.
  // `host` zaten mağaza context'ini taşıyor ama shop'u da ekleyerek hataları kapatıyoruz.
  const app = createApp({
    apiKey,
    host,
    shop,
    forceRedirect: true,
  });

  window.__STOCKPILOT_APP_BRIDGE__ = app;
  console.log("[StockPilot] App Bridge initialized", { shop, host });

  return app;
}

/**
 * Shopify Admin içinden çağrılınca otomatik session token ekler.
 * Token yoksa / embed değilse düz fetch yapar.
 */
export async function authorizedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const app = getAppBridge();

  if (!app) {
    console.warn("[StockPilot] authorizedFetch: App Bridge yok, düz fetch.");
    return fetch(input, init);
  }

  // authenticatedFetch hem token alır hem de 401/redirect akışını yönetir.
  if (!window.__STOCKPILOT_AUTH_FETCH__) {
    window.__STOCKPILOT_AUTH_FETCH__ = authenticatedFetch(app);
  }

  return window.__STOCKPILOT_AUTH_FETCH__!(input, init);
}

/**
 * Debug için tek seferlik token görmek istersen.
 */
export async function debugGetSessionToken() {
  const app = getAppBridge();
  if (!app) return null;
  try {
    return await getSessionToken(app);
  } catch (e) {
    console.error("[StockPilot] getSessionToken error", e);
    return null;
  }
}
