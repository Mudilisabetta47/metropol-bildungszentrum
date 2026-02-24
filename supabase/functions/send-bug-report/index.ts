import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BugReport {
  title: string;
  description: string;
  priority: string;
  page: string;
  reportedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, priority, page, reportedBy }: BugReport = await req.json();

    if (!title || !description) {
      throw new Error("Titel und Beschreibung sind erforderlich");
    }

    if (!RESEND_API_KEY) {
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

    const priorityColors: Record<string, string> = {
      low: "#22c55e",
      medium: "#f59e0b",
      high: "#ef4444",
      critical: "#dc2626",
    };

    const priorityLabels: Record<string, string> = {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      critical: "Kritisch",
    };

    const color = priorityColors[priority] || "#f59e0b";
    const label = priorityLabels[priority] || priority;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);">
            <div style="background:#1a1a2e;padding:30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">🐛 Fehlermeldung</h1>
            </div>
            <div style="padding:30px;">
              <div style="display:inline-block;background:${color};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:20px;">
                ${label}
              </div>
              <h2 style="color:#333;margin:0 0 15px;font-size:20px;">${title}</h2>
              <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:20px;border-left:4px solid ${color};">
                <p style="margin:0;color:#555;white-space:pre-wrap;">${description}</p>
              </div>
              <div style="background:#e3f2fd;border-radius:8px;padding:15px;">
                <p style="margin:0;color:#555;font-size:13px;">
                  <strong>Seite:</strong> ${page}<br>
                  <strong>Gemeldet von:</strong> ${reportedBy}<br>
                  <strong>Zeitpunkt:</strong> ${timestamp}
                </p>
              </div>
            </div>
            <div style="background:#f8f9fa;padding:15px 30px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#888;font-size:12px;">Metropol Admin – Automatische Fehlermeldung</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Metropol System <info@metropol-bz.de>",
        to: ["info@metropol-bz.de"],
        subject: `🐛 [${label}] ${title}`,
        html: emailHtml,
      }),
    });

    const result = await emailResponse.json();
    console.log("Bug report email result:", result);

    if (!emailResponse.ok) {
      throw new Error(`Email sending failed: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-bug-report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
