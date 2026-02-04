import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AcceptInvitationRequest {
  token: string;
  userId: string;
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

    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body));
    
    const { token, userId }: AcceptInvitationRequest = body;

    if (!token || !userId) {
      console.error("Missing token or userId:", { token: !!token, userId: !!userId });
      throw new Error("Token und User ID sind erforderlich");
    }

    console.log("Accepting portal invitation:", { token: token.substring(0, 8) + "...", userId });

    // 1. Get the invitation
    const { data: invitation, error: invError } = await supabase
      .from("participant_portal_invitations")
      .select("*, participants(id, email)")
      .eq("token", token)
      .is("accepted_at", null)
      .maybeSingle();

    if (invError) {
      console.error("Error fetching invitation:", invError);
      throw new Error("Einladung konnte nicht gefunden werden");
    }

    if (!invitation) {
      throw new Error("Einladung nicht gefunden oder bereits verwendet");
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error("Einladung ist abgelaufen");
    }

    const participant = invitation.participants as { id: string; email: string } | null;
    if (!participant) {
      throw new Error("Teilnehmer nicht gefunden");
    }

    // 2. Link participant to user
    const { error: linkError } = await supabase
      .from("participants")
      .update({ user_id: userId })
      .eq("id", participant.id);

    if (linkError) {
      console.error("Error linking participant:", linkError);
      throw new Error("Teilnehmer konnte nicht verknüpft werden");
    }

    // 3. Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from("participant_portal_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (acceptError) {
      console.error("Error marking invitation as accepted:", acceptError);
      // Don't throw, the user is already linked
    }

    // 4. Add user role (optional - for participant role)
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "user" });

    if (roleError && !roleError.message.includes("duplicate")) {
      console.error("Error adding user role:", roleError);
    }

    console.log("Portal invitation accepted successfully for participant:", participant.id);

    return new Response(
      JSON.stringify({ success: true, participantId: participant.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Error in accept-portal-invitation:", errorMessage);
    
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
