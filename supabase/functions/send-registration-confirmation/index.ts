import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConfirmationRequest {
  email: string;
  firstName: string;
  lastName: string;
  courseName: string;
  locationName: string;
  startDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      firstName,
      lastName,
      courseName,
      locationName,
      startDate,
    }: ConfirmationRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    // Validate required fields
    if (!email || !firstName || !courseName) {
      throw new Error("Missing required fields");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Format the start date
    const formattedDate = startDate
      ? new Date(startDate).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Wird bekannt gegeben";

    const emailHtml = `
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
                Vielen Dank für Ihre Anmeldung!
              </h2>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                Hallo ${firstName} ${lastName},
              </p>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
                wir freuen uns, Ihre Anmeldung für den folgenden Kurs bestätigen zu können:
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #00CC28;">
                <p style="margin: 0 0 12px 0; color: #333333;">
                  <strong>Kurs:</strong> ${courseName}
                </p>
                <p style="margin: 0 0 12px 0; color: #333333;">
                  <strong>Standort:</strong> ${locationName || "Wird bekannt gegeben"}
                </p>
                <p style="margin: 0; color: #333333;">
                  <strong>Startdatum:</strong> ${formattedDate}
                </p>
              </div>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>Nächste Schritte:</strong><br>
                Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um alle weiteren Details zu besprechen und offene Fragen zu klären.
              </p>
              <p style="color: #555555; line-height: 1.6; margin: 0 0 30px 0;">
                Bei Fragen können Sie uns jederzeit kontaktieren:
              </p>
              <div style="text-align: center;">
                <a href="tel:+49511123456" style="display: inline-block; background-color: #00CC28; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">
                  0511 123 456
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

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Metropol Bildungszentrum <info@metropol-bz.de>",
        to: [email],
        subject: `Anmeldebestätigung: ${courseName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-registration-confirmation function:", error);
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
