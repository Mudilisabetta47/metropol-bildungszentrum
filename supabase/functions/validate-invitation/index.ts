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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length > 200) {
      return new Response(
        JSON.stringify({ error: "Ungültiger Token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: invitation, error } = await supabase
      .from("participant_portal_invitations")
      .select("id, email, participant_id, expires_at, accepted_at, participants(first_name, last_name)")
      .eq("token", token)
      .maybeSingle();

    if (error || !invitation) {
      return new Response(
        JSON.stringify({ error: "Einladung nicht gefunden" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Return invitation data WITHOUT the token itself
    return new Response(
      JSON.stringify({ invitation }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Error in validate-invitation:", err);
    return new Response(
      JSON.stringify({ error: "Unbekannter Fehler" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
