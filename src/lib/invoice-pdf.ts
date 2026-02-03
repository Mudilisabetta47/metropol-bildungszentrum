import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceWithItems } from "@/hooks/useInvoices";
import type { SiteSettingsMap } from "@/hooks/useSiteSettings";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function generateInvoicePDF(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function
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

  // Company Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(settings.company_name || "Metropol Bildungszentrum GmbH", margin, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(settings.company_address || "", margin, y);
  y += 5;
  doc.text(settings.company_zip_city || "", margin, y);
  
  // Contact info on the right
  doc.text(`Tel: ${settings.central_phone || ""}`, pageWidth - margin - 50, y - 5);
  doc.text(`E-Mail: ${settings.central_email || ""}`, pageWidth - margin - 50, y);

  // Sender line (small)
  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `${settings.company_name} · ${settings.company_address} · ${settings.company_zip_city}`,
    margin,
    y
  );
  doc.setTextColor(0);

  // Recipient address
  y += 10;
  doc.setFontSize(11);
  doc.text(invoice.recipient_name, margin, y);
  if (invoice.recipient_address) {
    y += 5;
    doc.text(invoice.recipient_address, margin, y);
  }
  if (invoice.recipient_zip_city) {
    y += 5;
    doc.text(invoice.recipient_zip_city, margin, y);
  }

  // Invoice details on the right
  const detailsX = pageWidth - margin - 60;
  let detailsY = y - 15;
  
  doc.setFontSize(10);
  doc.text("Rechnungsnummer:", detailsX, detailsY);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_number, detailsX + 45, detailsY);
  
  detailsY += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Rechnungsdatum:", detailsX, detailsY);
  doc.text(formatDate(invoice.invoice_date), detailsX + 45, detailsY);

  if (invoice.service_date) {
    detailsY += 6;
    doc.text("Leistungsdatum:", detailsX, detailsY);
    doc.text(formatDate(invoice.service_date), detailsX + 45, detailsY);
  }

  if (invoice.due_date) {
    detailsY += 6;
    doc.text("Fällig am:", detailsX, detailsY);
    doc.text(formatDate(invoice.due_date), detailsX + 45, detailsY);
  }

  // Invoice title
  y += 25;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RECHNUNG", margin, y);

  // Items table
  y += 10;
  
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
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // Summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - margin - 70;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Netto
  doc.text("Nettobetrag:", summaryX, y);
  doc.text(formatCurrency(invoice.net_amount), pageWidth - margin, y, { align: "right" });
  
  // MwSt
  y += 6;
  doc.text(`MwSt. (${invoice.vat_rate}%):`, summaryX, y);
  doc.text(formatCurrency(invoice.vat_amount), pageWidth - margin, y, { align: "right" });
  
  // Line
  y += 3;
  doc.setDrawColor(0);
  doc.line(summaryX, y, pageWidth - margin, y);
  
  // Brutto
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Gesamtbetrag:", summaryX, y);
  doc.text(formatCurrency(invoice.gross_amount), pageWidth - margin, y, { align: "right" });

  // Payment info
  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bitte überweisen Sie den Betrag auf folgendes Konto:", margin, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Bankverbindung:", margin, y);
  doc.setFont("helvetica", "normal");
  
  y += 6;
  doc.text(`Bank: ${settings.company_bank_name || "-"}`, margin, y);
  y += 5;
  doc.text(`IBAN: ${settings.company_iban || "-"}`, margin, y);
  y += 5;
  doc.text(`BIC: ${settings.company_bic || "-"}`, margin, y);
  y += 5;
  doc.text(`Verwendungszweck: ${invoice.invoice_number}`, margin, y);

  // Notes
  if (invoice.notes) {
    y += 15;
    doc.setFont("helvetica", "italic");
    doc.text("Hinweis: " + invoice.notes, margin, y, { maxWidth: pageWidth - 2 * margin });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");

  const footerText = [
    `${settings.company_name} · ${settings.company_address} · ${settings.company_zip_city}`,
    `Geschäftsführer: ${settings.company_ceo || "-"} · ${settings.company_register || ""}`,
    `Steuernummer: ${settings.company_tax_id || "-"} · USt-IdNr.: ${settings.company_vat_id || "-"}`,
  ];

  footerText.forEach((text, i) => {
    doc.text(text, pageWidth / 2, footerY + i * 4, { align: "center" });
  });

  return doc;
}

export function downloadInvoicePDF(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): void {
  const doc = generateInvoicePDF(invoice, settings);
  doc.save(`Rechnung_${invoice.invoice_number}.pdf`);
}

export function getInvoicePDFBlob(
  invoice: InvoiceWithItems,
  settings: SiteSettingsMap
): Blob {
  const doc = generateInvoicePDF(invoice, settings);
  return doc.output("blob");
}
