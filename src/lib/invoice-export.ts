import type { InvoiceWithItems } from "@/hooks/useInvoices";
import { format } from "date-fns";

// Status translations
const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  partial: "Teilbezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
  refunded: "Erstattet",
};

/**
 * Export invoices as CSV for accountants
 */
export function exportInvoicesCSV(invoices: InvoiceWithItems[]): void {
  const headers = [
    "Rechnungsnr.",
    "Rechnungsdatum",
    "Kunde",
    "Netto (EUR)",
    "MwSt. (EUR)",
    "Brutto (EUR)",
    "MwSt.-Satz",
    "Status",
    "Fällig am",
    "Bezahlt am",
    "Zahlungsart",
    "Zahlungsreferenz",
  ];

  const rows = invoices.map((inv) => [
    inv.invoice_number,
    format(new Date(inv.invoice_date), "dd.MM.yyyy"),
    inv.recipient_name,
    inv.net_amount.toFixed(2).replace(".", ","),
    inv.vat_amount.toFixed(2).replace(".", ","),
    inv.gross_amount.toFixed(2).replace(".", ","),
    `${inv.vat_rate}%`,
    statusLabels[inv.status] || inv.status,
    inv.due_date ? format(new Date(inv.due_date), "dd.MM.yyyy") : "",
    inv.paid_at ? format(new Date(inv.paid_at), "dd.MM.yyyy") : "",
    inv.payment_method || "",
    inv.payment_reference || "",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  downloadCSV(csvContent, `Rechnungen_Export_${format(new Date(), "yyyy-MM-dd")}.csv`);
}

/**
 * Export invoices in DATEV format
 * Format follows DATEV Buchungsstapel specifications
 */
export function exportInvoicesDATEV(invoices: InvoiceWithItems[]): void {
  // DATEV header row (simplified version)
  const headers = [
    "Umsatz (ohne Soll/Haben-Kz)",
    "Soll/Haben-Kennzeichen",
    "WKZ Umsatz",
    "Kurs",
    "Basis-Umsatz",
    "WKZ Basis-Umsatz",
    "Konto",
    "Gegenkonto (ohne BU-Schlüssel)",
    "BU-Schlüssel",
    "Belegdatum",
    "Belegfeld 1",
    "Belegfeld 2",
    "Skonto",
    "Buchungstext",
    "Postensperre",
    "Diverse Adressnummer",
    "Geschäftspartnerbank",
    "Sachverhalt",
    "Zinssperre",
    "Beleglink",
    "Beleginfo - Art 1",
    "Beleginfo - Inhalt 1",
    "Beleginfo - Art 2",
    "Beleginfo - Inhalt 2",
    "EU-Land u. UStID",
    "EU-Steuersatz",
    "Abw. Versteuerungsart",
  ];

  const rows = invoices
    .filter((inv) => inv.status !== "draft" && inv.status !== "cancelled")
    .map((inv) => {
      // DATEV uses comma as decimal separator
      const amount = inv.gross_amount.toFixed(2).replace(".", ",");
      const invoiceDate = format(new Date(inv.invoice_date), "ddMM"); // DDMM format
      
      return [
        amount, // Umsatz
        "S", // Soll
        "EUR", // Währung
        "", // Kurs
        "", // Basis-Umsatz
        "", // WKZ Basis
        "8400", // Erlöskonto (Erlöse 19% USt)
        "10000", // Debitorenkonto (kann angepasst werden)
        "", // BU-Schlüssel
        invoiceDate, // Belegdatum
        inv.invoice_number, // Belegfeld 1
        "", // Belegfeld 2
        "", // Skonto
        inv.recipient_name.substring(0, 60), // Buchungstext (max 60 Zeichen)
        "", // Postensperre
        "", // Diverse Adressnummer
        "", // Geschäftspartnerbank
        "", // Sachverhalt
        "", // Zinssperre
        "", // Beleglink
        "", // Beleginfo - Art 1
        "", // Beleginfo - Inhalt 1
        "", // Beleginfo - Art 2
        "", // Beleginfo - Inhalt 2
        "", // EU-Land
        "", // EU-Steuersatz
        "", // Abw. Versteuerungsart
      ];
    });

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  downloadCSV(csvContent, `DATEV_Export_${format(new Date(), "yyyyMMdd")}.csv`);
}

/**
 * Export invoices with line items (detailed export)
 */
export function exportInvoicesDetailed(invoices: InvoiceWithItems[]): void {
  const headers = [
    "Rechnungsnr.",
    "Rechnungsdatum",
    "Kunde",
    "Kundenadresse",
    "PLZ/Ort",
    "E-Mail",
    "Position",
    "Beschreibung",
    "Menge",
    "Einheit",
    "Einzelpreis (EUR)",
    "Netto (EUR)",
    "MwSt.-Satz",
    "MwSt. (EUR)",
    "Brutto (EUR)",
    "Status",
    "Bezahlt (EUR)",
    "Zahlungsart",
  ];

  const rows: string[][] = [];

  invoices.forEach((inv) => {
    inv.invoice_items.forEach((item) => {
      rows.push([
        inv.invoice_number,
        format(new Date(inv.invoice_date), "dd.MM.yyyy"),
        inv.recipient_name,
        inv.recipient_address || "",
        inv.recipient_zip_city || "",
        inv.recipient_email || "",
        item.position.toString(),
        item.description,
        item.quantity.toString().replace(".", ","),
        item.unit || "Stück",
        item.unit_price.toFixed(2).replace(".", ","),
        item.net_amount.toFixed(2).replace(".", ","),
        `${item.vat_rate}%`,
        item.vat_amount.toFixed(2).replace(".", ","),
        item.gross_amount.toFixed(2).replace(".", ","),
        statusLabels[inv.status] || inv.status,
        (inv.paid_amount || 0).toFixed(2).replace(".", ","),
        inv.payment_method || "",
      ]);
    });
  });

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  downloadCSV(csvContent, `Rechnungen_Detailliert_${format(new Date(), "yyyy-MM-dd")}.csv`);
}

function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
