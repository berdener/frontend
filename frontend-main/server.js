import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");

// 1) Shopify iframe CSP
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://admin.shopify.com https://*.myshopify.com;"
  );
  next();
});

// 2) BACKEND proxy (CORS'u kökten bitirir)
const BACKEND = process.env.BACKEND_URL || "https://stockpilot-production-529d.up.railway.app";

// Frontend -> /be/* isteklerini backend'e ilet
app.use(
  "/be",
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    secure: true,
    pathRewrite: { "^/be": "" }, // /be/api/products -> /api/products
  })
);

// 3) Static
app.use(express.static(DIST_DIR));

// 4) SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Frontend running on", port, "proxying to", BACKEND));

