import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AcceptInvitationRequest {
  token: string;
  password: string;
}

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

    const body = await req.json();
    const { token, password }: AcceptInvitationRequest = body;

    if (!token || !password) {
      throw new Error("Token und Passwort sind erforderlich");
    }

    if (password.length < 8) {
      throw new Error("Das Passwort muss mindestens 8 Zeichen lang sein");
    }

    console.log("Accepting portal invitation:", { token: token.substring(0, 8) + "..." });

    // 1. Get the invitation
    const { data: invitation, error: invError } = await supabase
      .from("participant_portal_invitations")
      .select("*, participants(id, email, first_name, last_name)")
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

    const participant = invitation.participants as { id: string; email: string; first_name: string; last_name: string } | null;
    if (!participant) {
      throw new Error("Teilnehmer nicht gefunden");
    }

    // 2. Create user account via Admin API (bypasses signup restrictions)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: participant.email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: participant.first_name,
        last_name: participant.last_name,
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        throw new Error("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.");
      }
      throw new Error("Benutzer konnte nicht erstellt werden: " + authError.message);
    }

    if (!authData.user) {
      throw new Error("Benutzer konnte nicht erstellt werden");
    }

    const userId = authData.user.id;
    console.log("User created successfully:", userId);

    // 3. Link participant to user
    const { error: linkError } = await supabase
      .from("participants")
      .update({ user_id: userId })
      .eq("id", participant.id);

    if (linkError) {
      console.error("Error linking participant:", linkError);
      throw new Error("Teilnehmer konnte nicht verknüpft werden");
    }

    // 4. Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from("participant_portal_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (acceptError) {
      console.error("Error marking invitation as accepted:", acceptError);
    }

    // 5. Add user role
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
