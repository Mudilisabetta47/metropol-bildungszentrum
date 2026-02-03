import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendInvitationRequest {
  participantId: string;
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

    // Get auth user from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nicht autorisiert");
    }

    const { participantId }: SendInvitationRequest = await req.json();

    if (!participantId) {
      throw new Error("Teilnehmer-ID ist erforderlich");
    }

    console.log("Sending portal invitation for participant:", participantId);

    // 1. Get participant
    const { data: participant, error: partError } = await supabase
      .from("participants")
      .select("id, first_name, last_name, email, user_id")
      .eq("id", participantId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (partError || !participant) {
      console.error("Error fetching participant:", partError);
      throw new Error("Teilnehmer nicht gefunden");
    }

    if (participant.user_id) {
      throw new Error("Teilnehmer hat bereits einen Portal-Zugang");
    }

    // 2. Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("participant_portal_invitations")
      .select("id, expires_at")
      .eq("participant_id", participantId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvitation) {
      throw new Error("Es gibt bereits eine aktive Einladung für diesen Teilnehmer");
    }

    // 3. Generate invitation token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();

    // 4. Create invitation record
    const { data: authUser } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    
    const { error: invError } = await supabase
      .from("participant_portal_invitations")
      .insert({
        participant_id: participantId,
        email: participant.email,
        token,
        created_by: authUser.user?.id,
      });

    if (invError) {
      console.error("Error creating invitation:", invError);
      throw new Error("Einladung konnte nicht erstellt werden");
    }

    // 5. Get company settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["company_name", "company_email"]);

    const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, s.value]));
    const companyName = settingsMap.company_name || "Metropol Bildungszentrum";
    const companyEmail = settingsMap.company_email || "info@metropol-bildung.de";

    // 6. Build invitation URL
    const baseUrl = req.headers.get("origin") || "https://metropol-bildungszentrum.lovable.app";
    const invitationUrl = `${baseUrl}/portal/einladung/${token}`;

    // 7. Send email
    const { error: emailError } = await resend.emails.send({
      from: `${companyName} <${companyEmail}>`,
      to: [participant.email],
      subject: `Ihr Zugang zum Teilnehmer-Portal - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0;">${companyName}</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hallo ${participant.first_name}!</h2>
          
          <p>Sie wurden zum Teilnehmer-Portal eingeladen. Dort können Sie:</p>
          
          <ul style="margin: 20px 0;">
            <li>Ihre gebuchten Kurse einsehen</li>
            <li>Zertifikate herunterladen</li>
            <li>Rechnungen abrufen</li>
            <li>Ihre Kontaktdaten verwalten</li>
          </ul>
          
          <p>Klicken Sie auf den folgenden Link, um Ihren Zugang einzurichten:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Zugang einrichten
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Dieser Link ist 7 Tage gültig. Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="${invitationUrl}" style="color: #059669; word-break: break-all;">${invitationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            Bei Fragen erreichen Sie uns unter ${companyEmail}
          </p>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("E-Mail konnte nicht gesendet werden: " + emailError.message);
    }

    console.log("Portal invitation sent successfully to:", participant.email);

    return new Response(
      JSON.stringify({ success: true, email: participant.email }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Error in send-portal-invitation:", errorMessage);
    
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
