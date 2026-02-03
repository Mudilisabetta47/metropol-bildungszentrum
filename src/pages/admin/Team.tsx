import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  UserPlus,
  Mail,
  Shield,
  Clock,
  Trash2,
  Users,
  ShieldCheck,
  GraduationCap,
  HeadphonesIcon,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  is_active: boolean;
  roles: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  employee: "Mitarbeiter",
  instructor: "Dozent",
  support: "Support",
};

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <ShieldCheck className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  employee: <Users className="h-4 w-4" />,
  instructor: <GraduationCap className="h-4 w-4" />,
  support: <HeadphonesIcon className="h-4 w-4" />,
};

const roleColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800 border-red-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  employee: "bg-blue-100 text-blue-800 border-blue-200",
  instructor: "bg-green-100 text-green-800 border-green-200",
  support: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch team members with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const membersWithRoles: TeamMember[] = (profiles || []).map((profile) => {
        const userRoles = (roles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          position: profile.position,
          is_active: profile.is_active ?? true,
          roles: userRoles,
        };
      });

      // Only show users who have a staff role
      const staffMembers = membersWithRoles.filter(
        (m) => m.roles.length > 0 && m.roles.some(r => ['super_admin', 'admin', 'employee', 'instructor', 'support'].includes(r))
      );

      setMembers(staffMembers);

      // Fetch pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from("staff_invitations")
        .select("*")
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;
      setInvitations(invites || []);
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Team-Daten konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
      });
      return;
    }

    setIsInviting(true);
    try {
      const token = generateToken();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create invitation
      const { error: inviteError } = await supabase
        .from("staff_invitations")
        .insert([{
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole as "admin" | "employee" | "instructor" | "super_admin" | "support" | "user",
          token,
          invited_by: user.id,
        }]);

      if (inviteError) throw inviteError;

      // In a real implementation, you would send an email here
      // For now, we'll show the invite link
      const inviteUrl = `${window.location.origin}/invite/${token}`;

      toast({
        title: "Einladung erstellt",
        description: (
          <div className="space-y-2">
            <p>Einladung für {inviteEmail} wurde erstellt.</p>
            <p className="text-xs break-all bg-muted p-2 rounded">
              Einladungslink: {inviteUrl}
            </p>
          </div>
        ),
      });

      setInviteEmail("");
      setInviteRole("employee");
      setInviteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einladung konnte nicht erstellt werden.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const deleteInvitation = async () => {
    if (!deleteInviteId) return;

    try {
      const { error } = await supabase
        .from("staff_invitations")
        .delete()
        .eq("id", deleteInviteId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Einladung wurde gelöscht.",
      });

      setDeleteInviteId(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einladung konnte nicht gelöscht werden.",
      });
    }
  };

  const getRoleBadge = (role: string) => (
    <Badge variant="outline" className={`${roleColors[role] || ""} flex items-center gap-1`}>
      {roleIcons[role]}
      {roleLabels[role] || role}
    </Badge>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">
            Mitarbeiter verwalten und neue einladen
          </p>
        </div>
        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Einladen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mitarbeiter einladen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mitarbeiter@beispiel.de"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rolle</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Mitarbeiter
                        </div>
                      </SelectItem>
                      <SelectItem value="instructor">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Dozent
                        </div>
                      </SelectItem>
                      <SelectItem value="support">
                        <div className="flex items-center gap-2">
                          <HeadphonesIcon className="h-4 w-4" />
                          Support
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={sendInvitation}
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Einladung wird erstellt...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Einladung senden
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Offene Einladungen ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{getRoleBadge(invite.role)}</TableCell>
                    <TableCell>
                      {format(new Date(invite.expires_at), "dd.MM.yyyy HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteInviteId(invite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Teammitglieder ({members.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Noch keine Teammitglieder vorhanden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Rollen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">
                        {member.first_name || member.last_name
                          ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.position || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map((role) => (
                          <span key={role}>{getRoleBadge(role)}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteInviteId} onOpenChange={() => setDeleteInviteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Einladung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Einladung wirklich löschen? Der Einladungslink wird
              ungültig und kann nicht mehr verwendet werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={deleteInvitation}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
