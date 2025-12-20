function safeBtoa(input: string) {
  return window.btoa(unescape(encodeURIComponent(input)));
}

function storeHandleFromShop(shop: string) {
  return shop.replace(".myshopify.com", "");
}

export function getParam(name: string): string | null {
  // 1) Querystring
  const sp = new URLSearchParams(window.location.search || "");
  const v1 = sp.get(name);
  if (v1) return v1;

  // 2) Hash içi query (#/route?host=...)
  const hash = window.location.hash || "";
  const idx = hash.indexOf("?");
  if (idx !== -1) {
    const hashQuery = hash.substring(idx + 1);
    const hp = new URLSearchParams(hashQuery);
    const v2 = hp.get(name);
    if (v2) return v2;
  }

  // 3) Storage fallback
  return sessionStorage.getItem(`sp_${name}`);
}

export function ensureShopHost(): { shop: string | null; host: string | null } {
  const shop = getParam("shop");
  let host = getParam("host");

  // host yoksa üret (Shopify host mantığı)
  if (!host && shop) {
    const handle = storeHandleFromShop(shop);
    host = safeBtoa(`admin.shopify.com/store/${handle}`);
  }

  // Kaydet
  if (shop) sessionStorage.setItem("sp_shop", shop);
  if (host) sessionStorage.setItem("sp_host", host);

  return { shop, host };
}
