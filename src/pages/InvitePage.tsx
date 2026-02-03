import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, CheckCircle, XCircle } from "lucide-react";
import logoMetropol from "@/assets/logo-metropol.webp";

const passwordSchema = z.object({
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  employee: "Mitarbeiter",
  instructor: "Dozent",
  support: "Support",
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from("staff_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Ungültiger Einladungslink");
        return;
      }

      if (data.accepted_at) {
        setError("Diese Einladung wurde bereits verwendet");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("Diese Einladung ist abgelaufen");
        return;
      }

      setInvitation(data);
    } catch (err) {
      setError("Fehler beim Validieren der Einladung");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PasswordFormData) => {
    if (!invitation) return;

    setIsSubmitting(true);
    try {
      // Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Add the user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert([{
            user_id: authData.user.id,
            role: invitation.role as "admin" | "employee" | "instructor" | "super_admin" | "support" | "user",
          }]);

        if (roleError) {
          console.error("Role assignment error:", roleError);
          // Continue anyway - role can be assigned later
        }

        // Mark invitation as accepted
        await supabase
          .from("staff_invitations")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", invitation.id);

        setSuccess(true);
        toast({
          title: "Konto erstellt!",
          description: "Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.",
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Registrierung fehlgeschlagen";
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage,
      });
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-bold mb-2">Einladung ungültig</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/")} variant="outline">
                Zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Konto erstellt!</h2>
              <p className="text-muted-foreground mb-6">
                Bitte überprüfen Sie Ihre E-Mails zur Bestätigung Ihres Kontos.
                Sie werden in Kürze zur Anmeldeseite weitergeleitet.
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src={logoMetropol}
            alt="Metropol Bildungszentrum"
            className="h-12 mx-auto mb-4"
          />
          <CardTitle>Team beitreten</CardTitle>
          <CardDescription>
            Sie wurden als <strong>{roleLabels[invitation?.role || ""] || invitation?.role}</strong> eingeladen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={invitation?.email || ""}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  className="pl-10"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Konto wird erstellt...
                </>
              ) : (
                "Konto erstellen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
