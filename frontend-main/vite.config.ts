import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // dışarıdan erişim (Railway/iframe) için
  },
  preview: {
    port: 4173,
    host: true, // Railway'de preview dışarıdan erişsin
    allowedHosts: ["satisfied-grace-production.up.railway.app"],
  },
});
