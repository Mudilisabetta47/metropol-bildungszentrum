import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { token, password } = await req.json();

    if (!token || typeof token !== "string" || token.length > 200) {
      return new Response(
        JSON.stringify({ success: false, error: "Ungültiger Token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 1. Validate invitation
    const { data: invitation, error: invError } = await supabase
      .from("staff_invitations")
      .select("id, email, role, expires_at, accepted_at")
      .eq("token", token)
      .maybeSingle();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({ success: false, error: "Einladung nicht gefunden" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ success: false, error: "Diese Einladung wurde bereits verwendet" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Diese Einladung ist abgelaufen" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating user:", authError);
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        return new Response(
          JSON.stringify({ success: false, error: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Benutzer konnte nicht erstellt werden" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Benutzer konnte nicht erstellt werden" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = authData.user.id;

    // 3. Add user role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: invitation.role });

    if (roleError && !roleError.message.includes("duplicate")) {
      console.error("Error adding user role:", roleError);
    }

    // 4. Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from("staff_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (acceptError) {
      console.error("Error marking invitation as accepted:", acceptError);
    }

    console.log("Staff invitation accepted for:", invitation.email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Error in accept-staff-invitation:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unbekannter Fehler" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
