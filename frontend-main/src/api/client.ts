// src/api/client.ts
import { authorizedFetch } from "../utils/appBridge"; // Bu dosyanın içeriğini aşağıda vereceğim

const API =
  import.meta.env.VITE_API_URL ||
  "https://stockpilot-production-529d.up.railway.app";

function buildUrl(pathname: string, shop: string) {
  const url = new URL(pathname, API);
  url.searchParams.set("shop", shop);
  return url;
}

// DİKKAT: İlk parametre olarak 'app' nesnesini ekledik
export async function getProducts(app: any, shop: string) {
  const url = buildUrl("/api/products", shop);
  console.log("[StockPilot] getProducts ->", url.toString());

  // 'app' nesnesini authorizedFetch'e gönderiyoruz
  const res = await authorizedFetch(app, url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "omit",
  });

  console.log("[StockPilot] /api/products status:", res.status);
  
  if (!res.ok) {
    // Backend 401 döndürürse burada yakalanır
    if (res.status === 401) {
       console.error("Yetki hatası: Session Token geçersiz veya eksik.");
    }
    const text = await res.text().catch(() => "");
    console.error("[StockPilot] /api/products error body:", text);
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export async function updateStock(
  app: any, // Buraya da app eklendi
  shop: string,
  inventoryItemId: number,
  delta: number
) {
  const url = buildUrl("/api/stock/update", shop);
  console.log("[StockPilot] updateStock ->", url.toString());

  const res = await authorizedFetch(app, url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "omit",
    body: JSON.stringify({ inventory_item_id: inventoryItemId, delta }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Failed to update stock: " + text);
  }

  return res.json();
}
