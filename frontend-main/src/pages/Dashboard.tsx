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

const DEFAULT_THRESHOLD = 3;

const styles: any = {
  page: { minHeight: "100vh", background: "#F8FAFC" },

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
  navLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
    fontWeight: 400,
  },

  quickBtn: {
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background:
      "linear-gradient(135deg, #38BDF8 0%, #6366F1 45%, #EC4899 100%)",
    color: "#F9FAFB",
    boxShadow: "0 12px 30px rgba(59,130,246,0.45)",
    letterSpacing: 0.4,
    whiteSpace: "nowrap",
  },
  bulkBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.8)",
    background: "transparent",
    color: "#E2E8F0",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  langBtn: {
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.65)",
    background: "transparent",
    color: "#E2E8F0",
    fontSize: 11,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  wrap: { padding: 16, maxWidth: 1200, margin: "0 auto" },

  // Özet kutuları
  statsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: "0 1 180px",
    background: "#0F172A",
    color: "#E2E8F0",
    borderRadius: 12,
    padding: "10px 12px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.35)",
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: 0.7,
    color: "#94A3B8",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
  },
  helpText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },

  // Eski lowSection stilini bırakıyorum, istersen ileride kullanırız
  lowSection: {
    background: "#0F172A",
    color: "#E2E8F0",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 14,
    boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
  },

  topRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  tabs: { display: "flex", gap: 8 },
  btn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  btnDisabled: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    background: "#E2E8F0",
    color: "#64748B",
    fontSize: 13,
    cursor: "not-allowed",
  },
  btnActive: { background: "#0F172A", color: "#fff", borderColor: "#0F172A" },
  searchRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    maxWidth: 280,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    background: "#FFFFFF",
  },
  thresholdInput: {
    width: 80,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    background: "#FFFFFF",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#334155",
    padding: "10px 8px",
    background: "#F1F5F9",
    borderBottom: "1px solid #E2E8F0",
  },
  td: { padding: "10px 8px", borderBottom: "1px solid #E2E8F0", fontSize: 14 },
  qtyLow: { color: "#B45309", fontWeight: 700 },
  qtyOut: { color: "#B91C1C", fontWeight: 700 },
  chipMuted: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 999,
    background: "#E2E8F0",
    fontSize: 11,
    color: "#64748B",
  },
  input: {
    width: 72,
    padding: "6px 8px",
    border: "1px solid #E2E8F0",
    borderRadius: 6,
    fontSize: 14,
  },
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const shop = params.get("shop");

  useEffect(() => {
    if (!shop) navigate("/");
  }, [shop, navigate]);

  const [rows, setRows] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stockpilot_threshold");
      if (saved) {
        const n = parseInt(saved, 10);
        if (!Number.isNaN(n) && n >= 0 && n <= 999) {
          setThreshold(n);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("stockpilot_threshold", String(threshold));
    } catch {
      // ignore
    }
  }, [threshold]);

  useEffect(() => {
    if (!shop) return;
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
  }, [shop]);

  if (!shop) return null;

  const trackedRows = rows.filter((r) => r.inventoryManagement);

  const lowCount = trackedRows.filter(
    (r) => r.qty > 0 && r.qty <= threshold
  ).length;
  const outCount = trackedRows.filter((r) => r.qty === 0).length;
  const totalCount = rows.length;
  const trackedCount = trackedRows.length;

  // Azalan / biten listesi:
  // - Stok = 0 olanlar HER ZAMAN listede
  // - Stok > 0 ve threshold altında olanlar listede
  const lowOrOutRows = trackedRows.filter(
    (r) => r.qty === 0 || (r.qty > 0 && r.qty <= threshold)
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const isTracked = !!r.inventoryManagement;

    if (filter === "low" && !(isTracked && r.qty > 0 && r.qty <= threshold))
      return false;
    if (filter === "out" && !(isTracked && r.qty === 0)) return false;

    if (!normalizedSearch) return true;
    const haystack = `${r.productTitle} ${r.variantTitle} ${r.sku}`
      .toLowerCase()
      .trim();
    return haystack.includes(normalizedSearch);
  });

  async function onSave(row: VariantRow, newQty: number) {
    if (!shop) return;
    const isTracked = !!row.inventoryManagement;
    if (!isTracked) return;

    const delta = newQty - row.qty;
    if (delta === 0) return;

    setRows((prev) =>
      prev.map((r) =>
        r.inventoryItemId === row.inventoryItemId ? { ...r, qty: newQty } : r
      )
    );

    try {
      await updateStock(shop, row.inventoryItemId, delta);
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r.inventoryItemId === row.inventoryItemId ? { ...r, qty: row.qty } : r
        )
      );
      alert("Stok güncellenemedi. Tekrar deneyin.");
    }
  }

  const currentLang = i18n.language === "tr" ? "TR" : "EN";
  const nextLang = i18n.language === "tr" ? "EN" : "TR";

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.nav}>
        <div style={styles.navLeft}>
          <div>{t("dashboard.title")}</div>
        </div>

        <div style={styles.navRight}>
          {/* Hızlı stok */}
          <button
            style={styles.quickBtn}
            onClick={() =>
              navigate(`/quick?shop=${encodeURIComponent(shop!)}`)
            }
          >
            {t("dashboard.nav.quick")}
          </button>

          {/* CSV toplu güncelleme */}
          <button
            style={styles.bulkBtn}
            onClick={() =>
              navigate(`/csv?shop=${encodeURIComponent(shop!)}`)
            }
          >
            {t("dashboard.nav.bulk")}
          </button>

          {/* Mağaza + dil tuşu */}
          <span>{shop}</span>
          <button
            style={styles.langBtn}
            onClick={() =>
              i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr")
            }
          >
            {currentLang} · {nextLang}
          </button>
        </div>
      </div>

      <div style={styles.wrap}>
        {/* Azalan / biten stoklar kutusu */}
        <div
          style={{
            background: "#0F172A",
            color: "#E2E8F0",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 20,
            boxShadow: "0 12px 32px rgba(15,23,42,0.45)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          {/* Başlık */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {t("dashboard.lowSection.title")}
            </div>

            <div style={{ fontSize: 12, color: "#CBD5E1" }}>
              {t("dashboard.lowSection.countLabel", {
                count: lowOrOutRows.length,
              })}
            </div>
          </div>

          {/* Boş durum */}
          {lowOrOutRows.length === 0 && (
            <div
              style={{ fontSize: 12, color: "#94A3B8", padding: "6px 0" }}
            >
              {t("dashboard.lowSection.empty")}
            </div>
          )}

          {/* Liste */}
          {lowOrOutRows.length > 0 && (
            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                paddingRight: 4,
              }}
            >
              {lowOrOutRows.slice(0, 25).map((r) => (
                <div
                  key={r.inventoryItemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0 4px",
                    borderBottom: "1px solid rgba(148,163,184,0.18)",
                  }}
                >
                  {/* Sol taraf */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      maxWidth: "72%",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.productTitle}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.variantTitle} · SKU: {r.sku || "-"}
                    </span>
                  </div>

                  {/* Sağ taraf badge */}
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: r.qty === 0 ? "#DC2626" : "#D97706",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {r.qty === 0
                      ? t("dashboard.lowSection.badgeOut")
                      : t("dashboard.lowSection.badgeLow", { qty: r.qty })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Özet kutuları */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              {t("dashboard.stats.totalVariants")}
            </div>
            <div style={styles.statValue}>{totalCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              {t("dashboard.stats.tracked")}
            </div>
            <div style={styles.statValue}>{trackedCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              {t("dashboard.stats.lowOut")}
            </div>
            <div style={styles.statValue}>
              {t("dashboard.stats.lowOutValue", {
                low: lowCount,
                out: outCount,
              })}
            </div>
          </div>
        </div>

        {/* Yardım metni */}
        <div style={styles.helpText}>{t("dashboard.help")}</div>

        {/* Filtreler + arama */}
        <div style={styles.topRow}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.btn,
                ...(filter === "all" ? styles.btnActive : {}),
              }}
              onClick={() => setFilter("all")}
            >
              {t("dashboard.tabs.all", { count: rows.length })}
            </button>
            <button
              style={{
                ...styles.btn,
                ...(filter === "low" ? styles.btnActive : {}),
              }}
              onClick={() => setFilter("low")}
            >
              {t("dashboard.tabs.low", { count: lowCount })}
            </button>
            <button
              style={{
                ...styles.btn,
                ...(filter === "out" ? styles.btnActive : {}),
              }}
              onClick={() => setFilter("out")}
            >
              {t("dashboard.tabs.out", { count: outCount })}
            </button>
          </div>

          <div style={styles.searchRow}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder={t("dashboard.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>
                {t("dashboard.thresholdLabel")}
              </span>
              <input
                style={styles.thresholdInput}
                type="number"
                min={0}
                max={999}
                value={threshold}
                onChange={(e) => {
                  const v = parseInt(e.target.value || "0", 10);
                  if (Number.isNaN(v)) return;
                  if (v < 0) return setThreshold(0);
                  if (v > 999) return setThreshold(999);
                  setThreshold(v);
                }}
              />
            </div>
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div>{t("dashboard.loading")}</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t("dashboard.table.product")}</th>
                <th style={styles.th}>{t("dashboard.table.variant")}</th>
                <th style={styles.th}>{t("dashboard.table.sku")}</th>
                <th style={styles.th}>{t("dashboard.table.stock")}</th>
                <th style={styles.th}>{t("dashboard.table.update")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Row key={r.inventoryItemId} row={r} onSave={onSave} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={5}>
                    {t("dashboard.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({
  row,
  onSave,
}: {
  row: VariantRow;
  onSave: (row: VariantRow, newQty: number) => void;
}) {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(row.qty);
  const [saving, setSaving] = useState(false);

  useEffect(() => setVal(row.qty), [row.qty]);

  const isTracked = !!row.inventoryManagement;
  const qtyStyle =
    !isTracked
      ? {}
      : row.qty === 0
      ? styles.qtyOut
      : row.qty <= DEFAULT_THRESHOLD
      ? styles.qtyLow
      : {};

  return (
    <tr>
      <td style={styles.td}>{row.productTitle}</td>
      <td style={styles.td}>{row.variantTitle}</td>
      <td style={styles.td}>{row.sku}</td>
      <td style={{ ...styles.td, ...qtyStyle }}>
        {isTracked ? (
          row.qty
        ) : (
          <span style={styles.chipMuted}>
            {t("dashboard.row.notTracked")}
          </span>
        )}
      </td>
      <td style={styles.td}>
        {!isTracked ? (
          <button style={styles.btnDisabled} disabled>
            {t("dashboard.row.notEditable")}
          </button>
        ) : !edit ? (
          <button style={styles.btn} onClick={() => setEdit(true)}>
            {t("dashboard.row.edit")}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              style={styles.input}
              type="number"
              value={val}
              onChange={(e) => setVal(parseInt(e.target.value || "0", 10))}
            />
            <button
              style={{ ...styles.btn, background: "#2563EB", color: "#fff" }}
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSave(row, val);
                setSaving(false);
                setEdit(false);
              }}
            >
              {t("dashboard.row.save")}
            </button>
            <button
              style={styles.btn}
              onClick={() => {
                setVal(row.qty);
                setEdit(false);
              }}
            >
              {t("dashboard.row.cancel")}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
