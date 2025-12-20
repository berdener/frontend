import { createApp } from "@shopify/app-bridge";
import {
  authenticatedFetch,
  getSessionToken,
} from "@shopify/app-bridge/utilities";

import { ensureShopHost } from "../lib/shopifyParams";


/**
 * URL hash içinde shop var ama host yoksa:
 * - host'u storage'dan (yoksa generate ederek) alır
 * - hash query içine enjekte eder (reload yapmadan)
 *
 * Böylece HashRouter senaryosunda host kaybı biter.
 */
function ensureUrlHasHostAndShop() {
  const { shop, host } = ensureShopHost();
  if (!shop || !host) return;

  const hash = window.location.hash || ""; // "#/dashboard?shop=..."
  // Hash hiç yoksa, en azından "/#/" yapısına taşıyabiliriz
  const effectiveHash = hash.length ? hash : "#/";

  const qIndex = effectiveHash.indexOf("?");

  const pathPart = qIndex === -1 ? effectiveHash : effectiveHash.substring(0, qIndex); // "#/dashboard"
  const queryPart = qIndex === -1 ? "" : effectiveHash.substring(qIndex + 1); // "shop=..."

  const hp = new URLSearchParams(queryPart);
  const hasShop = !!hp.get("shop");
  const hasHost = !!hp.get("host");

  // shop var ama host yoksa host'u ekle
  if (hasShop && !hasHost) {
    hp.set("host", host);
    const newHash = `${pathPart}?${hp.toString()}`;
    window.history.replaceState(null, "", newHash);
    return;
  }

  // ikisi de yoksa (nadiren) ikisini de ekle
  if (!hasShop && !hasHost) {
    hp.set("shop", shop);
    hp.set("host", host);
    const newHash = `${pathPart}?${hp.toString()}`;
    window.history.replaceState(null, "", newHash);
  }
}

/**
 * Shopify Admin bazen `shop` ve `host` parametrelerini querystring'de,
 * bazen de hash router kullanan SPA'larda (#/route?... ) hash içinde taşır.
 * Biz ayrıca sessionStorage fallback kullanıyoruz (ensureShopHost).
 */
function getParamsFromUrl() {
  // Önce storage'da garanti altına al (host yoksa üretir)
  const { shop: shopFromStorage, host: hostFromStorage } = ensureShopHost();

  // Querystring
  const searchParams = new URLSearchParams(window.location.search || "");
  const shopFromSearch = searchParams.get("shop");
  const hostFromSearch = searchParams.get("host");

  // Hash query
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

  // URL'de host kaybını düzelt (HashRouter senaryosu)
  ensureUrlHasHostAndShop();

  const { shop, host } = getParamsFromUrl();
  const isEmbedded = window.top !== window.self;

  // Embedded değilken ARTIK return etmiyoruz.
  // forceRedirect'in çalışması için createApp çağrısı yapılmalı.
  if (!isEmbedded) {
    console.warn(
      "[StockPilot] Embedded değil; App Bridge yine de başlatılacak (forceRedirect devreye girecek)."
    );
    // return YOK
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

  // shop alanını eklemek (bazı senaryolarda) faydalı
  const app = createApp({
    apiKey,
    host,
    shop,
    forceRedirect: true,
  });

  window.__STOCKPILOT_APP_BRIDGE__ = app;
  console.log("[StockPilot] App Bridge initialized", { shop, host, isEmbedded });

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
