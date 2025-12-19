import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProducts, updateStock } from "../api/client";

type VariantRow = {
  productTitle: string;
  variantTitle: string;
  sku: string;
  qty: number;
  inventoryItemId: number;
  inventoryManagement: string | null;
};

type Mode = "down" | "up";

const styles: any = {
  page: { minHeight: "100vh", background: "#020617" },
  nav: {
    height: 64,
    background: "#0F172A",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    fontWeight: 700,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 400,
  },
  wrap: { padding: 16, maxWidth: 900, margin: "0 auto" },
  card: {
    background: "radial-gradient(circle at top left, #1e293b, #020617 65%)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 18px 45px rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.4)",
    color: "#E2E8F0",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 16 },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: "1 1 260px",
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #1E293B",
    background: "#020617",
    color: "#E2E8F0",
    fontSize: 13,
    outline: "none",
    height: 40,
  },
  modeBtn: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #1E293B",
    background: "#020617",
    color: "#CBD5F5",
    fontSize: 12,
    cursor: "pointer",
  },
  modeBtnActiveUp: {
    background: "#22C55E",
    borderColor: "#22C55E",
    color: "#0B1120",
    fontWeight: 600,
  },
  modeBtnActiveDown: {
    background: "#EF4444",
    borderColor: "#EF4444",
    color: "#F9FAFB",
    fontWeight: 600,
  },
  qtyInput: {
    width: 70,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #1E293B",
    background: "#020617",
    color: "#E2E8F0",
    fontSize: 13,
  },
  resultList: {
    marginTop: 10,
    borderTop: "1px solid rgba(148,163,184,0.4)",
    paddingTop: 10,
    maxHeight: 260,
    overflowY: "auto",
  },
  resultItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid rgba(30,41,59,0.6)",
    fontSize: 13,
  },
  resultLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  resultTitle: { fontWeight: 600, color: "#E5E7EB" },
  resultMeta: { fontSize: 11, color: "#9CA3AF" },
  resultRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  stockBadge: {
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 11,
    background: "#0F172A",
    color: "#E5E7EB",
  },
  btnApply: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "none",
    fontSize: 12,
    cursor: "pointer",
    background: "linear-gradient(135deg, #38BDF8, #6366F1)",
    color: "#F9FAFB",
  },
  backLink: {
    fontSize: 12,
    color: "#93C5FD",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: 8,
    display: "inline-block",
  },
};

export default function QuickUpdate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const shop = params.get("shop");

  const [rows, setRows] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("down");
  const [amount, setAmount] = useState<number>(1);
  const [filtered, setFiltered] = useState<VariantRow[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!shop) {
      navigate("/");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await getProducts(shop);
        const flat: VariantRow[] = [];
        for (const p of data.products || []) {
          for (const v of p.variants || []) {
            flat.push({
              productTitle: p.title,
              variantTitle: v.title,
              sku: v.sku || "-",
              qty: v.inventory_quantity ?? 0,
              inventoryItemId: v.inventory_item_id,
              inventoryManagement: v.inventory_management ?? null,
            });
          }
        }
        setRows(flat);
      } finally {
        setLoading(false);
      }
    })();
  }, [shop, navigate]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }
    const result = rows.filter((r) => {
      const haystack = `${r.productTitle} ${r.variantTitle} ${r.sku}`
        .toLowerCase()
        .trim();
      return haystack.includes(q);
    });
    setFiltered(result.slice(0, 20));
  }, [query, rows]);

  const handleApply = async (row: VariantRow) => {
    if (!shop) return;
    if (!row.inventoryManagement) {
      alert(t("quick.errors.notTracked"));
      return;
    }
    if (!amount || amount <= 0) return;

    const delta = mode === "down" ? -amount : amount;

    if (mode === "down" && row.qty + delta < 0) {
      if (!window.confirm(t("quick.confirm.belowZero"))) {
        return;
      }
    }

    setUpdatingId(row.inventoryItemId);

    setRows((prev) =>
      prev.map((r) =>
        r.inventoryItemId === row.inventoryItemId
          ? { ...r, qty: r.qty + delta }
          : r
      )
    );
    setFiltered((prev) =>
      prev.map((r) =>
        r.inventoryItemId === row.inventoryItemId
          ? { ...r, qty: r.qty + delta }
          : r
      )
    );

    try {
      await updateStock(shop, row.inventoryItemId, delta);
    } catch (e) {
      alert(t("quick.errors.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!shop) return null;

  return (
    <div style={styles.page}>
      <div style={styles.nav}>
        <div>{t("quick.navTitle")}</div>
        <div style={styles.navRight}>
          <span>{shop}</span>
        </div>
      </div>

      <div style={styles.wrap}>
        <span
          style={styles.backLink}
          onClick={() =>
            navigate(`/dashboard?shop=${encodeURIComponent(shop)}`)
          }
        >
          {t("quick.backToDashboard")}
        </span>

        <div style={styles.card}>
          <div style={styles.title}>{t("quick.title")}</div>
          <div style={styles.subtitle}>{t("quick.subtitle")}</div>

          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              placeholder={t("quick.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />

            <button
              type="button"
              style={{
                ...styles.modeBtn,
                ...(mode === "down" ? styles.modeBtnActiveDown : {}),
              }}
              onClick={() => setMode("down")}
            >
              {t("quick.decrease")}
            </button>
            <button
              type="button"
              style={{
                ...styles.modeBtn,
                ...(mode === "up" ? styles.modeBtnActiveUp : {}),
              }}
              onClick={() => setMode("up")}
            >
              {t("quick.increase")}
            </button>

            <input
              style={styles.qtyInput}
              type="number"
              min={1}
              max={999}
              value={amount}
              onChange={(e) => {
                const v = parseInt(e.target.value || "1", 10);
                if (Number.isNaN(v) || v <= 0) return setAmount(1);
                if (v > 999) return setAmount(999);
                setAmount(v);
              }}
            />
          </div>

          {loading && (
            <div style={{ fontSize: 12 }}>{t("quick.loadingProducts")}</div>
          )}

          <div style={styles.resultList}>
            {query && !loading && filtered.length === 0 && (
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                {t("quick.noMatch")}
              </div>
            )}

            {filtered.map((r) => (
              <div key={r.inventoryItemId} style={styles.resultItem}>
                <div style={styles.resultLeft}>
                  <div style={styles.resultTitle}>{r.productTitle}</div>
                  <div style={styles.resultMeta}>
                    {r.variantTitle} · SKU: {r.sku || "-"}
                  </div>
                </div>
                <div style={styles.resultRight}>
                  <div style={styles.stockBadge}>
                    {t("quick.stockLabel", { qty: r.qty })}
                  </div>
                  <button
                    style={styles.btnApply}
                    disabled={updatingId === r.inventoryItemId}
                    onClick={() => handleApply(r)}
                  >
                    {updatingId === r.inventoryItemId
                      ? t("quick.processing")
                      : t("quick.apply")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
