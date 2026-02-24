import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  course: string;
  location?: string;
  message?: string;
  source?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      name,
      email,
      phone,
      course,
      location,
      message,
      source,
    }: ContactRequest = await req.json();

    console.log("Processing contact notification for:", email);

    // Validate required fields
    if (!email || !name || !course) {
      throw new Error("Missing required fields: email, name, or course");
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const timestamp = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Send confirmation email to the customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #00CC28; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                Metropol Bildungszentrum
              </h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                Vielen Dank für Ihre Anfrage!
              </h2>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                Hallo ${name},
              </p>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
                wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #00CC28;">
                <p style="margin: 0 0 12px 0; color: #333333;">
                  <strong>Ihr Interesse:</strong> ${course}
                </p>
                ${location ? `<p style="margin: 0 0 12px 0; color: #333333;"><strong>Standort:</strong> ${location}</p>` : ""}
                ${message ? `<p style="margin: 0; color: #333333;"><strong>Ihre Nachricht:</strong> ${message}</p>` : ""}
              </div>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>Was passiert als nächstes?</strong><br>
                Ein Mitarbeiter wird sich innerhalb von 24 Stunden bei Ihnen melden, um alle Ihre Fragen zu beantworten.
              </p>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
                Sie können uns auch direkt erreichen:
              </p>
              <div style="text-align: center;">
                <a href="tel:+49511123456" style="display: inline-block; background-color: #00CC28; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                  📞 0511 123 456
                </a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 14px;">
                Metropol Bildungszentrum GmbH
              </p>
              <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                Hannover • Bremen • Garbsen
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #1a1a2e; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                🔔 Neue Kursanfrage!
              </h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                Eine neue Anfrage ist eingegangen am <strong>${timestamp}</strong>
              </p>
              
              <div style="background-color: #e8f5e9; border-radius: 8px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #00CC28;">
                <h3 style="margin: 0 0 15px 0; color: #00CC28;">Kursinteresse</h3>
                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">
                  ${course}
                </p>
                ${location ? `<p style="margin: 10px 0 0 0; color: #555555;">Standort: ${location}</p>` : ""}
              </div>

              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333333;">Kontaktdaten</h3>
                <p style="margin: 0 0 8px 0; color: #333333;">
                  <strong>Name:</strong> ${name}
                </p>
                <p style="margin: 0 0 8px 0; color: #333333;">
                  <strong>E-Mail:</strong> <a href="mailto:${email}" style="color: #00CC28;">${email}</a>
                </p>
                ${phone ? `<p style="margin: 0; color: #333333;"><strong>Telefon:</strong> <a href="tel:${phone}" style="color: #00CC28;">${phone}</a></p>` : '<p style="margin: 0; color: #888888;"><em>Keine Telefonnummer angegeben</em></p>'}
              </div>

              ${message ? `
              <div style="background-color: #fff8e1; border-radius: 8px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <h3 style="margin: 0 0 15px 0; color: #333333;">Nachricht</h3>
                <p style="margin: 0; color: #555555; white-space: pre-wrap;">${message}</p>
              </div>
              ` : ""}

              <div style="background-color: #e3f2fd; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; color: #555555; font-size: 12px;">
                  <strong>Quelle:</strong> ${source || "Direkt"}<br>
                  <strong>Zeitpunkt:</strong> ${timestamp}
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" style="display: inline-block; background-color: #00CC28; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">
                  Jetzt antworten
                </a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #888888; font-size: 12px;">
                Diese E-Mail wurde automatisch vom Metropol Bildungszentrum Website-System gesendet.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation to customer
    console.log("Sending confirmation email to customer:", email);
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Metropol Bildungszentrum <onboarding@resend.dev>",
        to: [email],
        subject: `Ihre Anfrage: ${course} - Metropol Bildungszentrum`,
        html: customerEmailHtml,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "High",
        },
      }),
    });

    const customerResult = await customerEmailResponse.json();
    console.log("Customer email result:", customerResult);

    if (!customerEmailResponse.ok) {
      console.error("Failed to send customer email:", customerResult);
    }

    // Send notification to admin
    // Admin email addresses
    const adminEmails = ["info@metropol-bz.de"];
    
    console.log("Sending notification email to admin:", adminEmails);
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Metropol Website <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🔔 Neue Anfrage: ${course} von ${name}`,
        html: adminEmailHtml,
        reply_to: email,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "High",
        },
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin email result:", adminResult);

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin email:", adminResult);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmail: customerEmailResponse.ok,
        adminEmail: adminEmailResponse.ok,
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
