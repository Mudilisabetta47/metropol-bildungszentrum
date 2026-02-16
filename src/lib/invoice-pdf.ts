import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceWithItems } from "@/hooks/useInvoices";
import type { SiteSettingsMap } from "@/hooks/useSiteSettings";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Logo as base64 will be loaded dynamically
let cachedLogoBase64: string | null = null;

async function loadLogoAsBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;
  
  try {
    const logoModule = await import("@/assets/logo-metropol.webp");
    const logoUrl = logoModule.default;
    
    const response = await fetch(logoUrl);
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
  } catch (error) {
    console.error("Failed to load logo:", error);
    return null;
  }
}

export async function generateInvoicePDF(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const rightCol = 130;

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  // === HEADER AREA ===

  // Black bar at top right for company name
  doc.setFillColor(0, 0, 0);
  doc.rect(rightCol - 5, 10, pageWidth - rightCol + 5 - 10, 12, "F");

  // Company name in white on black bar
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(settings.company_name || "Metropol Bildungszentrum GmbH", rightCol, 19);

  // Subtitle under black bar
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text("Ihr Partner für berufliche Weiterbildung", rightCol, 27);

  // Logo on the left (above sender line)
  const logoBase64 = await loadLogoAsBase64();
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "WEBP", margin, 12, 40, 15);
    } catch {
      // Fallback: no logo
    }
  }

  // Company address block (right column)
  let rightY = 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text(settings.company_name || "Metropol Bildungszentrum GmbH", rightCol, rightY);
  rightY += 4.5;
  doc.text(settings.company_address || "Podbielskistraße 333", rightCol, rightY);
  rightY += 4.5;
  doc.text(settings.company_zip_city || "30659 Hannover", rightCol, rightY);
  rightY += 8;
  doc.setTextColor(80);
  doc.text(`Tel.: ${settings.central_phone || ""}`, rightCol, rightY);
  rightY += 4.5;
  doc.text(`E-Mail: ${settings.central_email || ""}`, rightCol, rightY);
  rightY += 4.5;
  if (settings.company_website) {
    doc.text(`Internet: ${settings.company_website}`, rightCol, rightY);
    rightY += 4.5;
  }

  // === SENDER LINE (small, underlined) ===
  let y = 55;
  doc.setFontSize(7);
  doc.setTextColor(100);
  const senderLine = `${settings.company_name || ""} – ${settings.company_address || ""} – ${settings.company_zip_city || ""}`;
  doc.text(senderLine, margin, y);
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 1.5, margin + doc.getTextWidth(senderLine), y + 1.5);

  // === RECIPIENT ADDRESS ===
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.recipient_name, margin, y);
  if (invoice.recipient_address) {
    y += 5.5;
    doc.text(invoice.recipient_address, margin, y);
  }
  if (invoice.recipient_zip_city) {
    y += 5.5;
    doc.text(invoice.recipient_zip_city, margin, y);
  }

  // === INVOICE METADATA (right side) ===
  let metaY = 75;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  doc.text("Datum:", rightCol, metaY);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.invoice_date), rightCol + 35, metaY);

  metaY += 5;
  doc.setTextColor(80);
  doc.text("Rechnung Nr.:", rightCol, metaY);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_number, rightCol + 35, metaY);

  if (invoice.participant_id) {
    metaY += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Kunde Nr.:", rightCol, metaY);
    doc.setTextColor(0);
    doc.text(invoice.participant_id.substring(0, 8).toUpperCase(), rightCol + 35, metaY);
  }

  // === TITLE: "Rechnung" ===
  y = Math.max(y + 20, 105);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Rechnung", margin, y);

  // Service period
  if (invoice.service_period_start && invoice.service_period_end) {
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text(
      `Leistungszeitraum: ${formatDate(invoice.service_period_start)} bis ${formatDate(invoice.service_period_end)}`,
      margin,
      y
    );
  } else if (invoice.service_date) {
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text(`Leistungsdatum: ${formatDate(invoice.service_date)}`, margin, y);
  }

  // === GREETING / INTRO TEXT ===
  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);

  const recipientGreeting = `Sehr geehrte/r ${invoice.recipient_name},`;
  doc.text(recipientGreeting, margin, y);

  y += 7;
  doc.text(
    "vielen Dank für Ihr Vertrauen. Hiermit erlauben wir uns, folgenden Betrag in Rechnung zu stellen:",
    margin,
    y,
    { maxWidth: pageWidth - 2 * margin }
  );

  // === AMOUNTS (clean, simple style like reference) ===
  y += 14;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);

  // If there are multiple items, show a table
  if (invoice.invoice_items.length > 1) {
    const tableData = invoice.invoice_items.map((item) => [
      item.position.toString(),
      item.description,
      `${item.quantity} ${item.unit || "Stück"}`,
      formatCurrency(item.unit_price),
      formatCurrency(item.net_amount),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Netto"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  } else if (invoice.invoice_items.length === 1) {
    // Single item - show inline like reference
    const item = invoice.invoice_items[0];
    doc.text(`Leistung: ${item.description}`, margin, y);
    y += 8;
  }

  // Summary lines (simple, like the reference image)
  const labelX = margin;
  const valueX = margin + 55;

  doc.setFont("helvetica", "normal");
  doc.text("Nettobetrag:", labelX, y);
  doc.text(formatCurrency(invoice.net_amount), valueX, y);

  y += 6;
  doc.text(`zzgl. ${invoice.vat_rate}% MwSt.:`, labelX, y);
  doc.text(formatCurrency(invoice.vat_amount), valueX, y);

  y += 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(labelX, y + 2, valueX + 30, y + 2);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Gesamtbetrag:", labelX, y);
  doc.text(formatCurrency(invoice.gross_amount), valueX, y);

  // === PAYMENT INSTRUCTIONS (bold, like reference) ===
  y += 14;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);

  const paymentLine = `Bitte begleichen Sie den Gesamtbetrag von ${formatCurrency(invoice.gross_amount)}`;
  const dueLine = invoice.due_date
    ? ` bis zum ${formatDate(invoice.due_date)}`
    : "";
  doc.text(paymentLine + dueLine, margin, y, {
    maxWidth: pageWidth - 2 * margin,
  });

  y += 6;
  doc.text("auf das unten genannte Bankkonto.", margin, y);

  // === BANK DETAILS ===
  y += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, pageWidth - 2 * margin, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.text("Bankverbindung", margin + 5, y + 1);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(`Bank: ${settings.company_bank_name || "-"}`, margin + 5, y + 1);
  doc.text(`IBAN: ${settings.company_iban || "-"}`, margin + 80, y + 1);
  y += 5;
  doc.text(`BIC: ${settings.company_bic || "-"}`, margin + 5, y + 1);
  doc.text(`Verwendungszweck: ${invoice.invoice_number}`, margin + 80, y + 1);

  // === NOTES ===
  if (invoice.notes) {
    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(invoice.notes, margin, y, { maxWidth: pageWidth - 2 * margin });
  }

  // === CLOSING ===
  y += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text("Mit freundlichen Grüßen", margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text(settings.company_ceo || "Geschäftsführung", margin, y);
  // === FOOTER ===
  const footerY = pageHeight - 22;

  // Thin black line
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  // Footer in columns
  const col1X = margin;
  const col2X = margin + 45;
  const col3X = margin + 95;
  const col4X = margin + 140;

  // Column 1: Company
  doc.text(settings.company_name || "", col1X, footerY);
  doc.text(`Geschäftsführer: ${settings.company_ceo || "-"}`, col1X, footerY + 3.5);
  doc.text(settings.company_address || "", col1X, footerY + 7);
  doc.text(settings.company_zip_city || "", col1X, footerY + 10.5);

  // Column 2: Contact
  doc.text(`Tel.: ${settings.central_phone || "-"}`, col2X, footerY);
  doc.text(`E-Mail: ${settings.central_email || "-"}`, col2X, footerY + 3.5);
  if (settings.company_website) {
    doc.text(`Internet: ${settings.company_website}`, col2X, footerY + 7);
  }

  // Column 3: Bank
  doc.text(settings.company_bank_name || "", col3X, footerY);
  doc.text(`IBAN: ${settings.company_iban || "-"}`, col3X, footerY + 3.5);
  doc.text(`BIC: ${settings.company_bic || "-"}`, col3X, footerY + 7);

  // Column 4: Tax
  doc.text(`Steuer-Nr.: ${settings.company_tax_id || "-"}`, col4X, footerY);
  doc.text(settings.company_register || "", col4X, footerY + 3.5);
  if (settings.company_vat_id) {
    doc.text(`USt-IdNr.: ${settings.company_vat_id}`, col4X, footerY + 7);
  }

  return doc;
}

export async function downloadInvoicePDF(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): Promise<void> {
  const doc = await generateInvoicePDF(invoice, settings);
  doc.save(`Rechnung_${invoice.invoice_number}.pdf`);
}

export async function getInvoicePDFBlob(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): Promise<Blob> {
  const doc = await generateInvoicePDF(invoice, settings);
  return doc.output("blob");
}
