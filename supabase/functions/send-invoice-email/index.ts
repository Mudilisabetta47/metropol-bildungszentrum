import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InvoiceEmailRequest {
  invoiceId: string;
  recipientEmail: string;
  subject?: string;
  message?: string;
}

interface InvoiceItem {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  recipient_name: string;
  recipient_address: string | null;
  recipient_zip_city: string | null;
  recipient_email: string | null;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  invoice_date: string;
  service_date: string | null;
  due_date: string | null;
  notes: string | null;
  invoice_items: InvoiceItem[];
}

interface SiteSetting {
  key: string;
  value: string | null;
}

// Generate invoice PDF as base64
function generateInvoicePDFContent(invoice: Invoice, settings: Record<string, string>): string {
  // Create a simple text-based invoice for email
  // In production, you might want to use a proper PDF library
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  let content = `
RECHNUNG
========

${settings.company_name || "Metropol Bildungszentrum GmbH"}
${settings.company_address || ""}
${settings.company_zip_city || ""}

Rechnungsnummer: ${invoice.invoice_number}
Rechnungsdatum: ${formatDate(invoice.invoice_date)}
${invoice.service_date ? `Leistungsdatum: ${formatDate(invoice.service_date)}` : ""}
${invoice.due_date ? `Fällig am: ${formatDate(invoice.due_date)}` : ""}

An:
${invoice.recipient_name}
${invoice.recipient_address || ""}
${invoice.recipient_zip_city || ""}

----------------------------------------
POSITIONEN
----------------------------------------
`;

  invoice.invoice_items.forEach((item) => {
    content += `
${item.position}. ${item.description}
   ${item.quantity} ${item.unit} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.gross_amount)} (inkl. ${item.vat_rate}% MwSt.)
`;
  });

  content += `
----------------------------------------
Nettobetrag:      ${formatCurrency(invoice.net_amount)}
MwSt. (${invoice.vat_rate}%):    ${formatCurrency(invoice.vat_amount)}
----------------------------------------
GESAMTBETRAG:     ${formatCurrency(invoice.gross_amount)}
----------------------------------------

BANKVERBINDUNG
Bank: ${settings.company_bank_name || "-"}
IBAN: ${settings.company_iban || "-"}
BIC: ${settings.company_bic || "-"}
Verwendungszweck: ${invoice.invoice_number}

${invoice.notes ? `Hinweis: ${invoice.notes}` : ""}

---
${settings.company_name || "Metropol Bildungszentrum GmbH"}
Geschäftsführer: ${settings.company_ceo || "-"}
${settings.company_register || ""}
Steuernummer: ${settings.company_tax_id || "-"}
USt-IdNr.: ${settings.company_vat_id || "-"}
`;

  return content;
}

// Generate HTML email body
function generateEmailHTML(invoice: Invoice, settings: Record<string, string>, customMessage?: string): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .items-table th { background: #f1f5f9; }
    .totals { background: #f8fafc; padding: 15px; border-radius: 8px; }
    .bank-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .message { background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${settings.company_name || "Metropol Bildungszentrum GmbH"}</div>
    <div>${settings.company_address || ""} · ${settings.company_zip_city || ""}</div>
  </div>

  <p>Sehr geehrte(r) ${invoice.recipient_name},</p>

  ${customMessage ? `<div class="message">${customMessage}</div>` : `<p>anbei erhalten Sie Ihre Rechnung Nr. <strong>${invoice.invoice_number}</strong>.</p>`}

  <div class="invoice-details">
    <table style="width: 100%;">
      <tr>
        <td><strong>Rechnungsnummer:</strong></td>
        <td>${invoice.invoice_number}</td>
      </tr>
      <tr>
        <td><strong>Rechnungsdatum:</strong></td>
        <td>${formatDate(invoice.invoice_date)}</td>
      </tr>
      ${invoice.due_date ? `
      <tr>
        <td><strong>Zahlbar bis:</strong></td>
        <td>${formatDate(invoice.due_date)}</td>
      </tr>
      ` : ""}
      <tr>
        <td><strong>Gesamtbetrag:</strong></td>
        <td class="amount">${formatCurrency(invoice.gross_amount)}</td>
      </tr>
    </table>
  </div>

  <h3>Positionen</h3>
  <table class="items-table">
    <thead>
      <tr>
        <th>Beschreibung</th>
        <th style="text-align: right;">Menge</th>
        <th style="text-align: right;">Preis</th>
        <th style="text-align: right;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.invoice_items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: right;">${item.quantity} ${item.unit}</td>
        <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="text-align: right;">${formatCurrency(item.gross_amount)}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <table style="width: 100%;">
      <tr>
        <td>Nettobetrag:</td>
        <td style="text-align: right;">${formatCurrency(invoice.net_amount)}</td>
      </tr>
      <tr>
        <td>MwSt. (${invoice.vat_rate}%):</td>
        <td style="text-align: right;">${formatCurrency(invoice.vat_amount)}</td>
      </tr>
      <tr style="font-weight: bold; font-size: 18px;">
        <td>Gesamtbetrag:</td>
        <td style="text-align: right;">${formatCurrency(invoice.gross_amount)}</td>
      </tr>
    </table>
  </div>

  <div class="bank-info">
    <h4 style="margin-top: 0;">Bankverbindung</h4>
    <p style="margin: 0;">
      <strong>Bank:</strong> ${settings.company_bank_name || "-"}<br>
      <strong>IBAN:</strong> ${settings.company_iban || "-"}<br>
      <strong>BIC:</strong> ${settings.company_bic || "-"}<br>
      <strong>Verwendungszweck:</strong> ${invoice.invoice_number}
    </p>
  </div>

  ${invoice.notes ? `<p><em>Hinweis: ${invoice.notes}</em></p>` : ""}

  <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

  <p>Mit freundlichen Grüßen<br>
  <strong>${settings.company_name || "Metropol Bildungszentrum GmbH"}</strong></p>

  <div class="footer">
    ${settings.company_name || "Metropol Bildungszentrum GmbH"} · ${settings.company_address || ""} · ${settings.company_zip_city || ""}<br>
    Geschäftsführer: ${settings.company_ceo || "-"} · ${settings.company_register || ""}<br>
    Steuernummer: ${settings.company_tax_id || "-"} · USt-IdNr.: ${settings.company_vat_id || "-"}<br>
    Tel: ${settings.central_phone || "-"} · E-Mail: ${settings.central_email || "-"}
  </div>
</body>
</html>
`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invoiceId, recipientEmail, subject, message }: InvoiceEmailRequest = await req.json();

    if (!invoiceId || !recipientEmail) {
      throw new Error("Missing required fields: invoiceId, recipientEmail");
    }

    console.log(`Sending invoice ${invoiceId} to ${recipientEmail}`);

    // Fetch invoice with items
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message || "Unknown error"}`);
    }

    // Fetch site settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value");

    const settings: Record<string, string> = {};
    (settingsData || []).forEach((s: SiteSetting) => {
      if (s.value) settings[s.key] = s.value;
    });

    // Generate email content
    const emailSubject = subject || `Rechnung ${invoice.invoice_number} - ${settings.company_name || "Metropol Bildungszentrum"}`;
    const emailHTML = generateEmailHTML(invoice as Invoice, settings, message);
    const pdfContent = generateInvoicePDFContent(invoice as Invoice, settings);

    // Convert PDF content to base64
    const pdfBase64 = btoa(unescape(encodeURIComponent(pdfContent)));

    // Send email via Resend
    const resend = new Resend(resendApiKey);

    const fromEmail = settings.central_email 
      ? `${settings.company_name || "Metropol Bildungszentrum"} <${settings.central_email}>`
      : "Metropol Bildungszentrum <noreply@metropol-bz.de>";

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHTML,
      attachments: [
        {
          filename: `Rechnung_${invoice.invoice_number}.txt`,
          content: pdfBase64,
          contentType: "text/plain",
        },
      ],
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

    console.log("Email sent successfully:", emailResult);

    // Update invoice status to 'sent' if it was 'draft'
    if (invoice.status === "draft") {
      await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId);
    }

    // Log the action in invoice history
    await supabase
      .from("invoice_history")
      .insert({
        invoice_id: invoiceId,
        action: "sent",
        new_data: { sent_to: recipientEmail, sent_at: new Date().toISOString() },
        change_reason: `E-Mail an ${recipientEmail} gesendet`,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Rechnung wurde an ${recipientEmail} gesendet`,
        emailId: emailResult?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-invoice-email:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
