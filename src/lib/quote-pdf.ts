import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { QuoteWithItems } from "@/hooks/useQuotes";
import type { SiteSettingsMap } from "@/hooks/useSiteSettings";
import { format } from "date-fns";
import { de } from "date-fns/locale";

let cachedLogoBase64: string | null = null;

async function loadLogoAsBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const logoModule = await import("@/assets/logo-metropol.png");
    const response = await fetch(logoModule.default);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoBase64 = reader.result as string;
        resolve(cachedLogoBase64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateQuotePDF(
  quote: QuoteWithItems,
  settings: SiteSettingsMap
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const rightCol = 130;

  const vatExempt = (settings.vat_exemption_active || "true") === "true";
  const vatNote =
    settings.vat_exemption_note ||
    "Umsatzsteuerbefreit gemäß §4 Nr. 21 UStG (Bildungsleistung).";

  const formatCurrency = (a: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(a);
  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "dd.MM.yyyy", { locale: de }) : "-";

  // Header black bar with company name
  doc.setFillColor(0, 0, 0);
  doc.rect(rightCol - 5, 10, pageWidth - rightCol + 5 - 10, 12, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(settings.company_name || "Metropol Bildungszentrum GmbH", rightCol, 19);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text("Ihr Partner für berufliche Weiterbildung", rightCol, 27);

  const logo = await loadLogoAsBase64();
  if (logo) {
    try {
      doc.addImage(logo, "WEBP", margin, 12, 40, 15);
    } catch { /* ignore */ }
  }

  // Company address block
  let rightY = 35;
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(settings.company_name || "Metropol Bildungszentrum GmbH", rightCol, rightY);
  rightY += 4.5;
  doc.text(settings.company_address || "", rightCol, rightY);
  rightY += 4.5;
  doc.text(settings.company_zip_city || "", rightCol, rightY);
  rightY += 8;
  doc.setTextColor(80);
  doc.text(`Tel.: ${settings.central_phone || ""}`, rightCol, rightY);
  rightY += 4.5;
  doc.text(`E-Mail: ${settings.central_email || ""}`, rightCol, rightY);

  // Sender line
  let y = 55;
  doc.setFontSize(7);
  doc.setTextColor(100);
  const senderLine = `${settings.company_name || ""} – ${settings.company_address || ""} – ${settings.company_zip_city || ""}`;
  doc.text(senderLine, margin, y);
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 1.5, margin + doc.getTextWidth(senderLine), y + 1.5);

  // Recipient
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(quote.recipient_name, margin, y);
  if (quote.recipient_address) { y += 5.5; doc.text(quote.recipient_address, margin, y); }
  if (quote.recipient_zip_city) { y += 5.5; doc.text(quote.recipient_zip_city, margin, y); }

  // Metadata
  let metaY = 75;
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Datum:", rightCol, metaY);
  doc.setTextColor(0);
  doc.text(formatDate(quote.quote_date), rightCol + 35, metaY);
  metaY += 5;
  doc.setTextColor(80);
  doc.text("Kostenvoranschlag Nr.:", rightCol, metaY);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(quote.quote_number, rightCol + 35, metaY);
  if (quote.valid_until) {
    metaY += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Gültig bis:", rightCol, metaY);
    doc.setTextColor(0);
    doc.text(formatDate(quote.valid_until), rightCol + 35, metaY);
  }

  // Title
  y = Math.max(y + 20, 105);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Kostenvoranschlag", margin, y);

  // Intro
  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Sehr geehrte/r ${quote.recipient_name},`, margin, y);
  y += 7;
  doc.text(
    "vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes unverbindliches Angebot:",
    margin,
    y,
    { maxWidth: pageWidth - 2 * margin }
  );

  // Items table
  y += 10;
  const showVatCol = !vatExempt && quote.quote_items.some((i) => Number(i.vat_rate) > 0);
  const head = showVatCol
    ? [["Pos.", "Beschreibung", "Menge", "Einzelpreis", "MwSt.", "Netto"]]
    : [["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Betrag"]];
  const body = quote.quote_items.map((it) => {
    const base = [
      it.position.toString(),
      it.description,
      `${it.quantity} ${it.unit || "Stück"}`,
      formatCurrency(it.unit_price),
    ];
    return showVatCol
      ? [...base, `${it.vat_rate}%`, formatCurrency(it.net_amount)]
      : [...base, formatCurrency(it.net_amount)];
  });

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "plain",
    headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // Totals
  const labelX = margin;
  const valueX = margin + 55;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (vatExempt) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Gesamtbetrag:", labelX, y);
    doc.text(formatCurrency(quote.net_amount), valueX, y);
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(vatNote, labelX, y, { maxWidth: pageWidth - 2 * margin });
    doc.setTextColor(0);
  } else {
    doc.text("Nettobetrag:", labelX, y);
    doc.text(formatCurrency(quote.net_amount), valueX, y);
    y += 6;
    doc.text(`zzgl. ${quote.vat_rate}% MwSt.:`, labelX, y);
    doc.text(formatCurrency(quote.vat_amount), valueX, y);
    y += 2;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(labelX, y + 2, valueX + 30, y + 2);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Gesamtbetrag:", labelX, y);
    doc.text(formatCurrency(quote.gross_amount), valueX, y);
  }

  // Validity note
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  const validityText = quote.valid_until
    ? `Dieser Kostenvoranschlag ist unverbindlich und gültig bis zum ${formatDate(quote.valid_until)}.`
    : "Dieser Kostenvoranschlag ist unverbindlich.";
  doc.text(validityText, margin, y, { maxWidth: pageWidth - 2 * margin });

  // Notes
  if (quote.notes) {
    y += 10;
    doc.setTextColor(0);
    doc.text(quote.notes, margin, y, { maxWidth: pageWidth - 2 * margin });
  }

  // Closing
  y += 15;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text("Bei Fragen stehen wir Ihnen gerne zur Verfügung.", margin, y);
  y += 8;
  doc.text("Mit freundlichen Grüßen", margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text(settings.company_ceo || "Geschäftsführung", margin, y);

  // Footer
  const footerY = pageHeight - 22;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  const col1X = margin;
  const col2X = margin + 45;
  const col3X = margin + 95;
  const col4X = margin + 140;
  doc.text(settings.company_name || "", col1X, footerY);
  doc.text(`Geschäftsführer: ${settings.company_ceo || "-"}`, col1X, footerY + 3.5);
  doc.text(settings.company_address || "", col1X, footerY + 7);
  doc.text(settings.company_zip_city || "", col1X, footerY + 10.5);
  doc.text(`Tel.: ${settings.central_phone || "-"}`, col2X, footerY);
  doc.text(`E-Mail: ${settings.central_email || "-"}`, col2X, footerY + 3.5);
  if (settings.company_website) {
    doc.text(`Internet: ${settings.company_website}`, col2X, footerY + 7);
  }
  doc.text(settings.company_bank_name || "", col3X, footerY);
  doc.text(`IBAN: ${settings.company_iban || "-"}`, col3X, footerY + 3.5);
  doc.text(`BIC: ${settings.company_bic || "-"}`, col3X, footerY + 7);
  doc.text(`Steuer-Nr.: ${settings.company_tax_id || "-"}`, col4X, footerY);
  if (vatExempt) {
    doc.text("USt-befreit §4 Nr.21 UStG", col4X, footerY + 3.5);
  } else if (settings.company_vat_id) {
    doc.text(`USt-IdNr.: ${settings.company_vat_id}`, col4X, footerY + 3.5);
  }

  return doc;
}

export async function downloadQuotePDF(
  quote: QuoteWithItems,
  settings: SiteSettingsMap
): Promise<void> {
  const doc = await generateQuotePDF(quote, settings);
  doc.save(`Kostenvoranschlag_${quote.quote_number}.pdf`);
}
