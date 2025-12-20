// src/api/client.ts
import { authorizedFetch } from "../utils/appBridge"; // Senin yazdığın dosya

const API =
  import.meta.env.VITE_API_URL ||
  "https://stockpilot-production-529d.up.railway.app";

// URL oluşturucu
function buildUrl(pathname: string, shop: string) {
  const url = new URL(pathname, API);
  url.searchParams.set("shop", shop);
  return url;
}

// ARTIK 'app' PARAMETRESİNE GEREK YOK!
export async function getProducts(shop: string) {
  const url = buildUrl("/api/products", shop);
  console.log("[StockPilot] getProducts ->", url.toString());

  // Senin yazdığın authorizedFetch kullanılıyor
  // authenticatedFetch otomatik token eklediği için header ile uğraşmıyoruz
  const res = await authorizedFetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("[StockPilot] /api/products status:", res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[StockPilot] /api/products error body:", text);
    throw new Error("Failed to fetch products");
  }

  // authenticatedFetch bazen Response objesi döndürmeyebilir (versiyona göre),
  // ama standart kullanımda .json() çalışır.
  return res.json();
}

export async function updateStock(
  shop: string,
  inventoryItemId: number,
  delta: number
) {
  const url = buildUrl("/api/stock/update", shop);
  console.log("[StockPilot] updateStock ->", url.toString());

  const res = await authorizedFetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inventory_item_id: inventoryItemId, delta }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Failed to update stock: " + text);
  }

  return res.json();
}
