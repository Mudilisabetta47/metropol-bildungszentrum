import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logoMetropol from "@/assets/logo-metropol.webp";

interface Invitation {
  id: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
  participants: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Ungültiger Einladungslink");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("participant_portal_invitations")
        .select("*, participants(first_name, last_name, email)")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) {
        setError("Einladung nicht gefunden");
        setIsLoading(false);
        return;
      }

      if (data.accepted_at) {
        setError("Diese Einladung wurde bereits angenommen. Bitte melden Sie sich an.");
        setIsLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("Diese Einladung ist abgelaufen. Bitte kontaktieren Sie uns für eine neue Einladung.");
        setIsLoading(false);
        return;
      }

      setInvitation(data as Invitation);
      setIsLoading(false);
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (!invitation?.participants) {
      setError("Teilnehmerdaten nicht gefunden.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.participants.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: {
            first_name: invitation.participants.first_name,
            last_name: invitation.participants.last_name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.");
        } else {
          setError(authError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setError("Benutzer konnte nicht erstellt werden.");
        setIsSubmitting(false);
        return;
      }

      // 2. Call edge function to link participant and mark invitation as accepted
      const { error: linkError } = await supabase.functions.invoke("accept-portal-invitation", {
        body: { token, userId: authData.user.id },
      });

      if (linkError) {
        console.error("Link error:", linkError);
        // Continue anyway, the user is created
      }

      setSuccess(true);
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logoMetropol} alt="Metropol Bildungszentrum" className="h-16" />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Portal-Zugang einrichten</CardTitle>
            <CardDescription>
              {error ? (
                "Es gab ein Problem mit Ihrer Einladung"
              ) : success ? (
                "Ihr Zugang wurde erfolgreich eingerichtet"
              ) : (
                `Willkommen, ${invitation?.participants?.first_name}! Legen Sie jetzt Ihr Passwort fest.`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && !success && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button asChild>
                    <Link to="/portal/login">Zur Anmeldung</Link>
                  </Button>
                </div>
              </div>
            )}

            {success && (
              <div className="space-y-4">
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Ihr Zugang wurde erfolgreich eingerichtet. Bitte überprüfen Sie Ihre E-Mails, um Ihre E-Mail-Adresse zu bestätigen.
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button onClick={() => navigate("/portal/login")}>
                    Zur Anmeldung
                  </Button>
                </div>
              </div>
            )}

            {!error && !success && invitation && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitation.participants?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    required
                    minLength={8}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zugang wird eingerichtet...
                    </>
                  ) : (
                    "Zugang einrichten"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
