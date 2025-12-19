// src/pages/CSVUpdate.tsx

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

type CsvItem = {
  sku: string;
  newQty: number;
  variant?: VariantRow | null;
  status: "pending" | "ok" | "error" | "not-found" | "no-change";
};

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
  langBtn: {
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.65)",
    background: "transparent",
    color: "#E2E8F0",
    fontSize: 11,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  wrap: { padding: 16, maxWidth: 1000, margin: "0 auto" },

  backLink: {
    fontSize: 12,
    color: "#93C5FD",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: 8,
    display: "inline-block",
  },

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
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 12 },

  infoBox: {
    fontSize: 12,
    color: "#E5E7EB",
    background: "rgba(15,23,42,0.6)",
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px dashed rgba(148,163,184,0.6)",
    marginBottom: 14,
  },

  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  fileInput: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  templateBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #1E293B",
    background: "#020617",
    color: "#CBD5F5",
    fontSize: 12,
    cursor: "pointer",
  },
  applyBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    fontSize: 13,
    cursor: "pointer",
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    color: "#F9FAFB",
    fontWeight: 600,
  },
  applyBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  tableWrap: {
    marginTop: 10,
    maxHeight: 320,
    overflowY: "auto",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.45)",
    background: "#020617",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    position: "sticky",
    top: 0,
    background: "#0F172A",
    color: "#E5E7EB",
    textAlign: "left" as const,
    padding: "8px 10px",
    borderBottom: "1px solid rgba(148,163,184,0.5)",
  },
  td: {
    padding: "6px 10px",
    borderBottom: "1px solid rgba(30,41,59,0.9)",
    color: "#E5E7EB",
  },

  statusBadge: {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    textAlign: "center" as const,
  },
};

export default function CSVUpdate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const shop = params.get("shop");

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [csvItems, setCsvItems] = useState<CsvItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const currentLang = i18n.language === "tr" ? "TR" : "EN";
  const nextLang = i18n.language === "tr" ? "EN" : "TR";

  // Mağaza yoksa install sayfasına geri yolla
  useEffect(() => {
    if (!shop) navigate("/");
  }, [shop, navigate]);

  // Ürünleri çek
  useEffect(() => {
    if (!shop) return;

    (async () => {
      setLoadingProducts(true);
      try {
        const data = await getProducts(shop);
        const flat: VariantRow[] = [];
        for (const p of data.products || []) {
          for (const v of p.variants || []) {
            flat.push({
              productTitle: p.title,
              variantTitle: v.title,
              sku: v.sku || "",
              qty: v.inventory_quantity ?? 0,
              inventoryItemId: v.inventory_item_id,
              inventoryManagement: v.inventory_management ?? null,
            });
          }
        }
        setVariants(flat);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [shop]);

  if (!shop) return null;

  // Basit CSV parser: sku,qty başlıklı format
  const parseCsvText = (text: string): CsvItem[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idxSku = header.indexOf("sku");
    const idxQty = header.indexOf("qty");

    if (idxSku === -1 || idxQty === -1) {
      alert(t("csv.messages.headerInvalid"));
      return [];
    }

    const items: CsvItem[] = [];

    for (const line of lines.slice(1)) {
      const cols = line.split(",").map((c) => c.trim());
      if (!cols[idxSku]) continue;
      const sku = cols[idxSku];
      const qtyRaw = cols[idxQty] ?? "";
      const newQty = parseInt(qtyRaw, 10);
      if (Number.isNaN(newQty)) continue;

      const variant =
        variants.find((v) => (v.sku || "").trim() === sku.trim()) || null;

      items.push({
        sku,
        newQty,
        variant,
        status: variant ? "pending" : "not-found",
      });
    }

    return items;
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const text = await file.text();
    const parsed = parseCsvText(text);
    if (!parsed.length) {
      setCsvItems([]);
      return;
    }
    setCsvItems(parsed);
  };

  const handleDownloadTemplate = () => {
    const example = "sku,qty\nABC-001,10\nABC-002,5\n";
    const blob = new Blob([example], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockpilot-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAll = async () => {
    if (!shop) return;
    if (!csvItems.length) return;

    setProcessing(true);

    const updated: CsvItem[] = [];

    for (const item of csvItems) {
      const variant =
        item.variant ||
        variants.find((v) => (v.sku || "").trim() === item.sku.trim()) ||
        null;

      if (!variant || !variant.inventoryManagement) {
        updated.push({ ...item, variant, status: "not-found" });
        continue;
      }

      const delta = item.newQty - variant.qty;
      if (delta === 0) {
        updated.push({ ...item, variant, status: "no-change" });
        continue;
      }

      try {
        await updateStock(shop, variant.inventoryItemId, delta);

        setVariants((prev) =>
          prev.map((v) =>
            v.inventoryItemId === variant.inventoryItemId
              ? { ...v, qty: item.newQty }
              : v
          )
        );

        updated.push({ ...item, variant, status: "ok" });
      } catch (e) {
        console.error("CSV stock update error:", e);
        updated.push({ ...item, variant, status: "error" });
      }
    }

    setCsvItems(updated);
    setProcessing(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.nav}>
        <div>{t("csv.navTitle")}</div>
        <div style={styles.navRight}>
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
        <span
          style={styles.backLink}
          onClick={() =>
            navigate(`/dashboard?shop=${encodeURIComponent(shop)}`)
          }
        >
          {t("csv.backToDashboard")}
        </span>

        <div style={styles.card}>
          <div style={styles.title}>{t("csv.title")}</div>
          <div style={styles.subtitle}>{t("csv.subtitle")}</div>

          <div style={styles.infoBox}>
            <div>{t("csv.info.line1")}</div>
            <div>{t("csv.info.line2")}</div>
            <div>{t("csv.info.line3")}</div>
          </div>

          <div style={styles.row}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            {fileName && (
              <span style={{ fontSize: 11, color: "#CBD5E1" }}>
                {t("csv.controls.selectedFile")} {fileName}
              </span>
            )}

            <button
              type="button"
              style={styles.templateBtn}
              onClick={handleDownloadTemplate}
            >
              {t("csv.controls.downloadTemplate")}
            </button>

            <button
              type="button"
              style={{
                ...styles.applyBtn,
                ...(processing || !csvItems.length
                  ? styles.applyBtnDisabled
                  : {}),
              }}
              disabled={processing || !csvItems.length}
              onClick={handleApplyAll}
            >
              {processing
                ? t("csv.controls.applying")
                : t("csv.controls.applyButton")}
            </button>
          </div>

          {loadingProducts && (
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>
              {t("csv.messages.loadingProducts")}
            </div>
          )}

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("csv.table.sku")}</th>
                  <th style={styles.th}>{t("csv.table.productVariant")}</th>
                  <th style={styles.th}>{t("csv.table.oldStock")}</th>
                  <th style={styles.th}>{t("csv.table.newStock")}</th>
                  <th style={styles.th}>{t("csv.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {csvItems.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={5}>
                      {t("csv.messages.noFileYet")}
                    </td>
                  </tr>
                )}

                {csvItems.map((item, idx) => {
                  const v = item.variant;
                  const statusKey =
                    item.status === "ok"
                      ? "ok"
                      : item.status === "error"
                      ? "error"
                      : item.status === "not-found"
                      ? "not_found"
                      : item.status === "no-change"
                      ? "no_change"
                      : "pending";

                  const statusLabel = t(`csv.status.${statusKey}`);

                  const statusStyle =
                    statusKey === "ok"
                      ? { background: "#16A34A", color: "#ECFDF5" }
                      : statusKey === "error"
                      ? { background: "#B91C1C", color: "#FEE2E2" }
                      : statusKey === "not_found"
                      ? { background: "#92400E", color: "#FEF3C7" }
                      : statusKey === "no_change"
                      ? { background: "#0F172A", color: "#E5E7EB" }
                      : { background: "#0F172A", color: "#E5E7EB" };

                  return (
                    <tr key={`${item.sku}-${idx}`}>
                      <td style={styles.td}>{item.sku}</td>
                      <td style={styles.td}>
                        {v ? (
                          <>
                            <div>{v.productTitle}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                              {v.variantTitle}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "#F97316" }}>
                            {t("csv.table.skuNotMatched")}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>{v ? v.qty : "-"}</td>
                      <td style={styles.td}>{item.newQty}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...statusStyle,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
