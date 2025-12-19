// src/api/client.ts

import { authorizedFetch } from "../utils/appBridge";

const API =
  import.meta.env.VITE_API_URL ||
  "https://stockpilot-production-529d.up.railway.app";

function buildUrl(pathname: string, shop: string) {
  const url = new URL(pathname, API);
  url.searchParams.set("shop", shop);
  return url;
}

export async function getProducts(shop: string) {
  const url = buildUrl("/api/products", shop);
  console.log("[StockPilot] getProducts ->", url.toString());

  const res = await authorizedFetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // CORS için cookie taşımıyoruz; session token Authorization header'da.
    credentials: "omit",
  });

  console.log("[StockPilot] /api/products status:", res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[StockPilot] /api/products error body:", text);
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export async function updateStock(
  shop: string,
  inventoryItemId: number,
  delta: number
) {
  const url = buildUrl("/api/stock/update", shop);
  console.log("[StockPilot] updateStock ->", url.toString(), {
    inventoryItemId,
    delta,
  });

  const res = await authorizedFetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "omit",
    body: JSON.stringify({ inventory_item_id: inventoryItemId, delta }),
  });

  console.log("[StockPilot] /api/stock/update status:", res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[StockPilot] /api/stock/update error body:", text);
    throw new Error("Failed to update stock");
  }

  return res.json();
}
