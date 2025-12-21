import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridge } from "../utils/appBridge";

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(15,23,42,0.96)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 22px 60px rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.45)",
    color: "#E2E8F0",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 700 },
  langBtn: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.6)",
    background: "transparent",
    color: "#E2E8F0",
    fontSize: 11,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  description: { fontSize: 13, color: "#94A3B8", marginBottom: 16 },
  label: {
    fontSize: 12,
    color: "#CBD5F5",
    marginBottom: 4,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #1E293B",
    background: "#020617",
    color: "#E2E8F0",
    fontSize: 13,
    outline: "none",
  },
  hint: { marginTop: 6, fontSize: 11, color: "#64748B" },
  error: { marginTop: 6, fontSize: 11, color: "#F97373" },
  button: {
    marginTop: 16,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    background: "linear-gradient(135deg,#38BDF8,#6366F1,#EC4899)",
    color: "#F9FAFB",
    boxShadow: "0 12px 30px rgba(59,130,246,0.55)",
  },
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" },
  footer: { marginTop: 14, fontSize: 11, color: "#64748B" },
};

function getParamsFromUrl() {
  const sp = new URLSearchParams(window.location.search || "");
  const shopFromSearch = sp.get("shop");
  const hostFromSearch = sp.get("host");

  const hash = window.location.hash || "";
  let shopFromHash: string | null = null;
  let hostFromHash: string | null = null;

  const i = hash.indexOf("?");
  if (i !== -1) {
    const hp = new URLSearchParams(hash.substring(i + 1));
    shopFromHash = hp.get("shop");
    hostFromHash = hp.get("host");
  }

  return {
    shop: shopFromSearch || shopFromHash,
    host: hostFromSearch || hostFromHash,
  };
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export default function Install() {
  const { t, i18n } = useTranslation();

  const [shopInput, setShopInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmbedded = useMemo(() => window.top !== window.self, []);

  const remoteRedirect = (url: string) => {
    const app = getAppBridge();
    if (app) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, url);
      return;
    }
    window.top?.location?.assign(url);
  };

  // Kuruluysa otomatik dashboard
  useEffect(() => {
    const shop = sessionStorage.getItem("sp_shop");
    if (!shop) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/installed?shop=${shop}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.installed) window.location.hash = "#/dashboard";
      })
      .catch(() => {});
  }, []);

  // Embedded ise otomatik OAuth’a gönder
  useEffect(() => {
    if (!API_URL || !isEmbedded) return;

    const { shop, host } = getParamsFromUrl();
    if (!shop) return;

    const lockKey = "stockpilot_embed_autoredirect_v3";
    if (sessionStorage.getItem(lockKey) === "1") return;
    sessionStorage.setItem(lockKey, "1");

    const base = API_URL.replace(/\/+$/, "");
    const target =
      `${base}/auth/install-redirect?shop=${encodeURIComponent(shop)}` +
      (host ? `&host=${encodeURIComponent(host)}` : "");

    remoteRedirect(target);
  }, [isEmbedded]);

  // URL’den shop al
  useEffect(() => {
    const { shop } = getParamsFromUrl();
    if (shop) setShopInput(shop);
  }, []);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    setError(null);

    let normalized = shopInput.trim().toLowerCase();
    if (!normalized) {
      setError(t("install.errors.noShop"));
      return;
    }
    if (!normalized.includes(".")) {
      normalized = `${normalized}.myshopify.com`;
    }

    if (!API_URL) {
      setError("API URL not configured.");
      return;
    }

    setLoading(true);

    const base = API_URL.replace(/\/+$/, "");
    const url = `${base}/auth/install-redirect?shop=${encodeURIComponent(
      normalized
    )}`;

    if (isEmbedded) remoteRedirect(url);
    else window.location.assign(url);
  };

  const currentLang = i18n.language === "tr" ? "TR" : "EN";
  const nextLang = i18n.language === "tr" ? "EN" : "TR";

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.headerRow}>
          <div style={styles.title}>{t("install.title")}</div>
          <button
            type="button"
            style={styles.langBtn}
            onClick={() =>
              i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr")
            }
          >
            {currentLang} · {nextLang}
          </button>
        </div>

        <div style={styles.description}>{t("install.description")}</div>

        <label style={styles.label}>{t("install.labelShop")}</label>
        <input
          type="text"
          style={styles.input}
          placeholder={t("install.placeholderShop")}
          value={shopInput}
          onChange={(e) => setShopInput(e.target.value)}
        />

        <div style={styles.hint}>{t("install.note")}</div>
        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? "Redirecting..." : t("install.button")}
        </button>
      </form>
    </div>
  );
}
