import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendNotificationRequest {
  invoiceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nicht autorisiert");
    }

    const { invoiceId }: SendNotificationRequest = await req.json();

    if (!invoiceId) {
      throw new Error("Rechnungs-ID ist erforderlich");
    }

    console.log("Sending invoice notification for:", invoiceId);

    // 1. Get invoice with participant info
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        due_date,
        gross_amount,
        recipient_name,
        recipient_email,
        participant_id,
        participants (
          first_name,
          last_name,
          user_id
        )
      `)
      .eq("id", invoiceId)
      .maybeSingle();

    if (invError || !invoice) {
      console.error("Error fetching invoice:", invError);
      throw new Error("Rechnung nicht gefunden");
    }

    if (!invoice.recipient_email) {
      throw new Error("Keine E-Mail-Adresse für diese Rechnung vorhanden");
    }

    // 2. Get company settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["company_name", "company_email", "company_iban"]);

    const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, s.value]));
    const companyName = settingsMap.company_name || "Metropol Bildungszentrum";
    const companyEmail = settingsMap.company_email || "info@metropol-bildung.de";
    const companyIban = settingsMap.company_iban || "";

    // Format amounts
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    };

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString("de-DE");
    };

    // Check if participant has portal access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participantsData = invoice.participants as any;
    const participant = Array.isArray(participantsData) ? participantsData[0] : participantsData;
    const hasPortalAccess = participant?.user_id != null;

    // 3. Build portal URL
    const baseUrl = req.headers.get("origin") || "https://metropol-bz.de";
    const portalUrl = `${baseUrl}/portal/rechnungen`;

    // 4. Send email
    const { error: emailError } = await resend.emails.send({
      from: `${companyName} <${companyEmail}>`,
      to: [invoice.recipient_email],
      subject: `Neue Rechnung ${invoice.invoice_number} - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0; font-size: 24px;">${companyName}</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-top: 0;">Hallo ${invoice.recipient_name}!</h2>
            
            <p>Wir haben eine neue Rechnung für Sie erstellt:</p>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Rechnungsnummer:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${invoice.invoice_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Rechnungsdatum:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatDate(invoice.invoice_date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Fällig am:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatDate(invoice.due_date)}</td>
                </tr>
                <tr style="border-top: 2px solid #059669;">
                  <td style="padding: 12px 0 8px; font-weight: bold; font-size: 18px;">Gesamtbetrag:</td>
                  <td style="padding: 12px 0 8px; text-align: right; font-weight: bold; font-size: 18px; color: #059669;">${formatCurrency(invoice.gross_amount)}</td>
                </tr>
              </table>
            </div>
            
            ${hasPortalAccess ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" 
                   style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Rechnung im Portal anzeigen
                </a>
              </div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Im Portal können Sie die Rechnung als PDF herunterladen und alle Ihre Rechnungen einsehen.
              </p>
            ` : `
              <p style="color: #6b7280; font-size: 14px;">
                Die Rechnung wird Ihnen als PDF zugesendet. Bei Fragen wenden Sie sich gerne an uns.
              </p>
            `}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px; font-weight: bold; color: #374151;">Bankverbindung:</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                IBAN: ${companyIban}<br>
                Verwendungszweck: ${invoice.invoice_number}
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Bei Fragen erreichen Sie uns unter ${companyEmail}
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("E-Mail konnte nicht gesendet werden: " + emailError.message);
    }

    // 5. Update invoice status to 'sent' if it was 'draft'
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId)
      .eq("status", "draft");

    console.log("Invoice notification sent successfully to:", invoice.recipient_email);

    return new Response(
      JSON.stringify({ success: true, email: invoice.recipient_email }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Error in send-invoice-notification:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
