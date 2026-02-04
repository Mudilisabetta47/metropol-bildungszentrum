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
    // Dynamic import of the logo
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
  const margin = 20;
  let y = 15;

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

  // Brand color (Metropol Green)
  const brandColor: [number, number, number] = [5, 150, 105]; // #059669

  // Load and add logo
  const logoBase64 = await loadLogoAsBase64();
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "WEBP", margin, y, 50, 18);
      y += 5;
    } catch {
      // Fallback to text if image fails
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandColor);
      doc.text(settings.company_name || "Metropol Bildungszentrum", margin, y + 10);
    }
  } else {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text(settings.company_name || "Metropol Bildungszentrum", margin, y + 10);
  }

  // Company contact on the right
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const rightX = pageWidth - margin;
  doc.text(settings.company_address || "", rightX, y + 5, { align: "right" });
  doc.text(settings.company_zip_city || "", rightX, y + 10, { align: "right" });
  doc.text(`Tel: ${settings.central_phone || ""}`, rightX, y + 15, { align: "right" });
  doc.text(`E-Mail: ${settings.central_email || ""}`, rightX, y + 20, { align: "right" });

  // Sender line (small, above recipient)
  y += 35;
  doc.setFontSize(7);
  doc.setTextColor(120);
  const senderLine = `${settings.company_name} · ${settings.company_address} · ${settings.company_zip_city}`;
  doc.text(senderLine, margin, y);
  doc.setDrawColor(200);
  doc.line(margin, y + 2, margin + doc.getTextWidth(senderLine), y + 2);

  // Recipient address block
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.recipient_name, margin, y);
  if (invoice.recipient_address) {
    y += 5;
    doc.text(invoice.recipient_address, margin, y);
  }
  if (invoice.recipient_zip_city) {
    y += 5;
    doc.text(invoice.recipient_zip_city, margin, y);
  }

  // Invoice info box on the right
  const boxX = pageWidth - margin - 65;
  let boxY = y - 15;
  
  doc.setFillColor(248, 250, 252); // Light gray background
  doc.roundedRect(boxX - 5, boxY - 5, 70, 35, 2, 2, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Rechnungsnummer:", boxX, boxY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(invoice.invoice_number, boxX + 40, boxY);
  
  boxY += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Rechnungsdatum:", boxX, boxY);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.invoice_date), boxX + 40, boxY);

  if (invoice.service_date) {
    boxY += 7;
    doc.setTextColor(100);
    doc.text("Leistungsdatum:", boxX, boxY);
    doc.setTextColor(0);
    doc.text(formatDate(invoice.service_date), boxX + 40, boxY);
  }

  if (invoice.due_date) {
    boxY += 7;
    doc.setTextColor(100);
    doc.text("Fällig am:", boxX, boxY);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(formatDate(invoice.due_date), boxX + 40, boxY);
  }

  // Invoice title with accent bar
  y += 25;
  doc.setFillColor(...brandColor);
  doc.rect(margin, y - 5, 4, 12, "F");
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("RECHNUNG", margin + 10, y + 3);

  // Items table
  y += 15;
  
  const tableData = invoice.invoice_items.map((item) => [
    item.position.toString(),
    item.description,
    `${item.quantity} ${item.unit || "Stück"}`,
    formatCurrency(item.unit_price),
    `${item.vat_rate}%`,
    formatCurrency(item.gross_amount),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Pos.", "Beschreibung", "Menge", "Einzelpreis", "MwSt.", "Gesamt"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: brandColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // Summary section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - margin - 80;
  
  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX - 10, y - 5, 90, 32, 2, 2, "F");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  
  // Netto
  doc.text("Nettobetrag:", summaryX, y + 2);
  doc.text(formatCurrency(invoice.net_amount), pageWidth - margin, y + 2, { align: "right" });
  
  // MwSt
  y += 7;
  doc.text(`MwSt. (${invoice.vat_rate}%):`, summaryX, y + 2);
  doc.text(formatCurrency(invoice.vat_amount), pageWidth - margin, y + 2, { align: "right" });
  
  // Line
  y += 5;
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y + 2, pageWidth - margin, y + 2);
  
  // Brutto
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Gesamtbetrag:", summaryX, y + 2);
  doc.setTextColor(...brandColor);
  doc.text(formatCurrency(invoice.gross_amount), pageWidth - margin, y + 2, { align: "right" });

  // Payment info section
  y += 25;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bitte überweisen Sie den Betrag auf folgendes Konto:", margin, y);

  // Bank info in a subtle box
  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 28, 2, 2, "F");
  
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Bankverbindung", margin + 5, y);
  
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(`Bank: ${settings.company_bank_name || "-"}`, margin + 5, y);
  doc.text(`IBAN: ${settings.company_iban || "-"}`, margin + 70, y);
  y += 5;
  doc.text(`BIC: ${settings.company_bic || "-"}`, margin + 5, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Verwendungszweck: ${invoice.invoice_number}`, margin + 70, y);

  // Notes
  if (invoice.notes) {
    y += 18;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Hinweis: " + invoice.notes, margin, y, { maxWidth: pageWidth - 2 * margin });
  }

  // Footer with brand accent
  const footerY = doc.internal.pageSize.getHeight() - 20;
  
  // Accent line
  doc.setFillColor(...brandColor);
  doc.rect(0, footerY - 8, pageWidth, 1, "F");
  
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");

  const footerLines = [
    `${settings.company_name} · ${settings.company_address} · ${settings.company_zip_city}`,
    `Geschäftsführer: ${settings.company_ceo || "-"} · ${settings.company_register || ""}`,
    `Steuernummer: ${settings.company_tax_id || "-"} · USt-IdNr.: ${settings.company_vat_id || "-"}`,
  ];

  footerLines.forEach((text, i) => {
    doc.text(text, pageWidth / 2, footerY + i * 4, { align: "center" });
  });

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
