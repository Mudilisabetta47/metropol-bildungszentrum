import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettingsAdmin, useUpdateSiteSetting, SiteSetting } from "@/hooks/useSiteSettings";
import { Loader2, Key, Shield, Users, Globe, Building2, Phone, Mail, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Site settings
  const { data: siteSettings, isLoading: isLoadingSettings } = useSiteSettingsAdmin();
  const updateSetting = useUpdateSiteSetting();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (siteSettings) {
      const initial: Record<string, string> = {};
      siteSettings.forEach((s) => {
        initial[s.key] = s.value || "";
      });
      setEditedSettings(initial);
    }
  }, [siteSettings]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Ihr Passwort wurde geändert.",
      });

      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Passwort konnte nicht geändert werden.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
      });
      return;
    }

    setIsAddingAdmin(true);

    try {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", newAdminEmail.toLowerCase())
        .single();

      if (profileError || !profiles) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Benutzer nicht gefunden. Stellen Sie sicher, dass der Benutzer registriert ist.",
        });
        return;
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: profiles.user_id,
        role: "admin",
      });

      if (roleError) {
        if (roleError.code === "23505") {
          toast({
            variant: "destructive",
            title: "Fehler",
            description: "Dieser Benutzer ist bereits Admin.",
          });
        } else {
          throw roleError;
        }
        return;
      }

      toast({
        title: "Erfolg",
        description: `${newAdminEmail} wurde als Admin hinzugefügt.`,
      });

      setNewAdminEmail("");
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Admin konnte nicht hinzugefügt werden.",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (key: string) => {
    try {
      await updateSetting.mutateAsync({ key, value: editedSettings[key] });
      toast({
        title: "Gespeichert",
        description: "Die Einstellung wurde aktualisiert.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Einstellung konnte nicht gespeichert werden.",
      });
    }
  };

  const handleSaveAllSettings = async (category: string) => {
    if (!siteSettings) return;

    const categorySettings = siteSettings.filter((s) => s.category === category);
    
    try {
      for (const setting of categorySettings) {
        if (editedSettings[setting.key] !== setting.value) {
          await updateSetting.mutateAsync({ key: setting.key, value: editedSettings[setting.key] });
        }
      }
      toast({
        title: "Gespeichert",
        description: "Alle Einstellungen wurden aktualisiert.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Einstellungen konnten nicht gespeichert werden.",
      });
    }
  };

  const contactSettings = siteSettings?.filter((s) => s.category === "contact") || [];
  const companySettings = siteSettings?.filter((s) => s.category === "company") || [];

  const getIconForKey = (key: string) => {
    if (key.includes("phone")) return <Phone className="h-4 w-4" />;
    if (key.includes("email")) return <Mail className="h-4 w-4" />;
    if (key.includes("name") || key.includes("person") || key.includes("ceo")) return <User className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Konto- und Website-Einstellungen</p>
      </div>

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList>
          <TabsTrigger value="site">Website-Einstellungen</TabsTrigger>
          <TabsTrigger value="account">Kontoeinstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-6">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Contact Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Kontaktdaten
                  </CardTitle>
                  <CardDescription>
                    Zentrale Kontaktinformationen, die auf der gesamten Website angezeigt werden
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contactSettings.map((setting) => (
                      <div key={setting.id} className="space-y-2">
                        <Label htmlFor={setting.key} className="flex items-center gap-2">
                          {getIconForKey(setting.key)}
                          {setting.label}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={setting.key}
                            value={editedSettings[setting.key] || ""}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            placeholder={setting.description || ""}
                          />
                        </div>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => handleSaveAllSettings("contact")}
                      disabled={updateSetting.isPending}
                    >
                      {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kontaktdaten speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Firmendaten
                  </CardTitle>
                  <CardDescription>
                    Rechtliche Angaben für Impressum und Footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {companySettings.map((setting) => (
                      <div key={setting.id} className="space-y-2">
                        <Label htmlFor={setting.key} className="flex items-center gap-2">
                          {getIconForKey(setting.key)}
                          {setting.label}
                        </Label>
                        <Input
                          id={setting.key}
                          value={editedSettings[setting.key] || ""}
                          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                          placeholder={setting.description || ""}
                        />
                        {setting.description && (
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => handleSaveAllSettings("company")}
                      disabled={updateSetting.isPending}
                    >
                      {updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Firmendaten speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          {/* Account info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Kontoinformationen
              </CardTitle>
              <CardDescription>Ihre aktuellen Kontodaten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">E-Mail-Adresse</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rolle</Label>
                <p className="font-medium">{isAdmin ? "Administrator" : "Mitarbeiter"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Passwort ändern
              </CardTitle>
              <CardDescription>
                Ändern Sie Ihr Anmeldepasswort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Passwort ändern
              </Button>
            </CardContent>
          </Card>

          {/* Admin management (only for admins) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin-Verwaltung
                </CardTitle>
                <CardDescription>
                  Fügen Sie neue Administratoren hinzu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newAdminEmail">E-Mail des neuen Admins</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newAdminEmail"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@beispiel.de"
                      className="flex-1"
                    />
                    <Button onClick={handleAddAdmin} disabled={isAddingAdmin}>
                      {isAddingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Hinzufügen
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Der Benutzer muss bereits ein Konto haben, um als Admin hinzugefügt werden zu können.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
