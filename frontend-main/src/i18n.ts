import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      install: {
        title: "Install StockPilot",
        description:
          "Connect your Shopify store and manage your inventory faster.",
        labelShop: "Shop domain",
        placeholderShop: "your-store.myshopify.com",
        note: "Please enter your full shop domain in the format your-store.myshopify.com.",
        button: "Install app",
        errors: {
          noShop: "Please enter your shop domain.",
          blocked:
            "Install request was blocked by the browser. Please try again.",
        },
      },
      dashboard: {
        title: "StockPilot Dashboard",
        nav: {
          quick: "Quick stock",
          bulk: "CSV update",
        },
        stats: {
          totalVariants: "Total variants",
          tracked: "Inventory tracking enabled",
          lowOut: "Low / Out of stock",
          lowOutValue: "{{low}} low · {{out}} out",
        },
        help: "On this screen you can see all variants in your Shopify store and quickly track low or out-of-stock items. When you update the stock value for a variant with inventory tracking enabled, the Shopify inventory is updated instantly.",
        tabs: {
          all: "All ({{count}})",
          low: "Low ({{count}})",
          out: "Out ({{count}})",
        },
        searchPlaceholder: "Search by product, variant or SKU...",
        thresholdLabel: "Low stock threshold:",
        loading: "Loading...",
        empty: "No records",
        table: {
          product: "Product",
          variant: "Variant",
          sku: "SKU",
          stock: "Stock",
          update: "Update",
        },
        row: {
          notTracked: "Inventory not tracked",
          edit: "Edit",
          save: "Save",
          cancel: "Cancel",
          notEditable: "Not editable",
        },
        lowSection: {
          title: "Low & out-of-stock variants",
          countLabel: "{{count}} variants",
          empty: "No low or out-of-stock variants.",
          badgeLow: "Stock: {{qty}} · Low",
          badgeOut: "Stock: 0 · Out",
        },
      },
      quick: {
        navTitle: "StockPilot · Quick stock update",
        backToDashboard: "← Back to dashboard",
        title: "Quick stock update",
        subtitle:
          "Change inventory by typing the barcode, SKU or product name, then apply decrease / increase with a single click.",
        searchPlaceholder: "Type barcode, SKU or product name...",
        decrease: "Decrease stock",
        increase: "Increase stock",
        loadingProducts: "Loading products...",
        noMatch: "No matching products found.",
        stockLabel: "Stock: {{qty}}",
        apply: "Apply",
        processing: "Processing...",
        errors: {
          notTracked:
            "Inventory tracking is disabled for this variant. Please enable it in Shopify.",
          updateFailed: "Stock update failed. Please try again.",
        },
        confirm: {
          belowZero: "Stock will go below 0. Do you still want to continue?",
        },
      },
      csv: {
        navTitle: "StockPilot · Bulk CSV stock update",
        backToDashboard: "← Back to dashboard",
        title: "Bulk stock update with CSV",
        subtitle:
          "Prepare your stock list as CSV in sku,qty format. The app will match each row with the related variant and update stocks in bulk.",
        info: {
          line1: "• The first row must contain the headers: sku,qty",
          line2: "• qty is the new stock quantity (not a delta).",
          line3:
            "• If the SKU does not match any variant, that row will be marked as “Not found” and skipped.",
        },
        controls: {
          selectedFile: "Selected file:",
          downloadTemplate: "Download sample CSV",
          applyButton: "Apply stock changes",
          applying: "Updating...",
        },
        messages: {
          loadingProducts: "Loading products...",
          headerInvalid: "CSV header must be: sku,qty",
          noFileYet: "No CSV file has been uploaded yet.",
        },
        table: {
          sku: "SKU",
          productVariant: "Product / Variant",
          oldStock: "Old stock",
          newStock: "New stock",
          status: "Status",
          skuNotMatched: "SKU did not match",
        },
        status: {
          pending: "Pending",
          ok: "✓ Updated",
          error: "Error",
          not_found: "Not found",
          no_change: "No change",
        },
      },
    },
  },
  tr: {
    translation: {
      install: {
        title: "StockPilot Kur",
        description:
          "Shopify mağazanı bağla ve stoklarını çok daha hızlı yönet.",
        labelShop: "Mağaza adresi",
        placeholderShop: "your-store.myshopify.com",
        note: "Lütfen mağazanızın tam alan adını your-store.myshopify.com formatında girin.",
        button: "Uygulamayı yükle",
        errors: {
          noShop: "Lütfen mağaza alan adını girin.",
          blocked:
            "Yükleme isteği tarayıcı tarafından engellendi. Tekrar deneyin.",
        },
      },
      dashboard: {
        title: "StockPilot Paneli",
        nav: {
          quick: "Hızlı stok",
          bulk: "CSV güncelleme",
        },
        stats: {
          totalVariants: "Toplam varyant",
          tracked: "Stok takibi açık",
          lowOut: "Azalan / Biten",
          lowOutValue: "{{low}} azalan · {{out}} biten",
        },
        help: "Bu ekranda Shopify mağazanızdaki tüm varyantları görür, azalan ve biten stokları hızlıca takip edebilirsiniz. Stok takibi açık varyantlarda stok değerini düzenleyip kaydettiğinizde, Shopify stok miktarı anında güncellenir.",
        tabs: {
          all: "Tümü ({{count}})",
          low: "Azalan ({{count}})",
          out: "Biten ({{count}})",
        },
        searchPlaceholder: "Ürün adı, varyant veya SKU ara...",
        thresholdLabel: "Azalan stok eşiği:",
        loading: "Yükleniyor...",
        empty: "Kayıt yok",
        table: {
          product: "Ürün",
          variant: "Varyant",
          sku: "SKU",
          stock: "Stok",
          update: "Güncelle",
        },
        row: {
          notTracked: "Stok takip edilmiyor",
          edit: "Düzenle",
          save: "Kaydet",
          cancel: "Vazgeç",
          notEditable: "Düzenlenemez",
        },
        lowSection: {
          title: "Azalan ve biten stoklar",
          countLabel: "{{count}} varyant",
          empty: "Azalan veya biten stoklu ürün yok.",
          badgeLow: "Stok: {{qty}} · Az",
          badgeOut: "Stok: 0 · Bitti",
        },
      },
      quick: {
        navTitle: "StockPilot · Hızlı stok güncelleme",
        backToDashboard: "← Dashboard'a dön",
        title: "Hızlı stok güncelleme",
        subtitle:
          "Barkodu okutarak veya SKU / ürün adı yazarak varyantı bul, aşağıdan stok düş / artır işlemini tek tıkla uygula.",
        searchPlaceholder: "Barkod, SKU veya ürün adı yazın...",
        decrease: "Stok düş",
        increase: "Stok artır",
        loadingProducts: "Ürünler yükleniyor...",
        noMatch: "Eşleşen ürün bulunamadı.",
        stockLabel: "Stok: {{qty}}",
        apply: "Uygula",
        processing: "İşleniyor...",
        errors: {
          notTracked:
            "Bu varyantta stok takibi kapalı. Shopify'da stok takibini açmalısınız.",
          updateFailed: "Stok güncellenemedi. Tekrar deneyin.",
        },
        confirm: {
          belowZero: "Stok 0'ın altına düşecek. Yine de devam edilsin mi?",
        },
      },
      csv: {
        navTitle: "StockPilot · CSV toplu stok güncelleme",
        backToDashboard: "← Dashboard'a dön",
        title: "CSV ile toplu stok güncelleme",
        subtitle:
          "Elinizdeki stok listesini sku,qty formatında CSV olarak hazırlayın. Uygulama her satırı ilgili varyantla eşleştirip stokları toplu olarak günceller.",
        info: {
          line1: "• İlk satır mutlaka şu başlıkları içermeli: sku,qty",
          line2: "• qty alanı ürünün yeni stok miktarıdır (fark değil).",
          line3:
            "• SKU eşleşmezse satır “Bulunamadı” olarak işaretlenir ve işlenmez.",
        },
        controls: {
          selectedFile: "Seçilen dosya:",
          downloadTemplate: "Örnek CSV indir",
          applyButton: "Stokları uygula",
          applying: "Güncelleniyor...",
        },
        messages: {
          loadingProducts: "Ürünler yükleniyor...",
          headerInvalid: "CSV başlığı şu şekilde olmalı: sku,qty",
          noFileYet: "Henüz CSV yüklenmedi.",
        },
        table: {
          sku: "SKU",
          productVariant: "Ürün / Varyant",
          oldStock: "Eski stok",
          newStock: "Yeni stok",
          status: "Durum",
          skuNotMatched: "SKU eşleşmedi",
        },
        status: {
          pending: "Bekliyor",
          ok: "✓ Güncellendi",
          error: "Hata",
          not_found: "Bulunamadı",
          no_change: "Değişiklik yok",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "tr",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
