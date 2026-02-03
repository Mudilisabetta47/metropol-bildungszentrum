import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Award,
  Plus,
  Download,
  FileUp,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Certificate {
  id: string;
  certificate_number: string;
  title: string;
  issued_at: string;
  valid_until: string | null;
  pdf_url: string | null;
  status: string;
  notes: string | null;
  participants: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  courses: {
    id: string;
    title: string;
    category: string;
  } | null;
}

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
}

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "pending", label: "Ausstehend" },
  { value: "issued", label: "Ausgestellt" },
  { value: "revoked", label: "Widerrufen" },
];

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  issued: "Ausgestellt",
  revoked: "Widerrufen",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  issued: "bg-green-100 text-green-800",
  revoked: "bg-red-100 text-red-800",
};

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [newCertificate, setNewCertificate] = useState({
    participant_id: "",
    course_id: "",
    title: "",
    valid_until: "",
    notes: "",
  });

  useEffect(() => {
    fetchCertificates();
    fetchParticipants();
    fetchCourses();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          participants (id, first_name, last_name, email),
          courses (id, title, category)
        `)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Zertifikate konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data } = await supabase
        .from("participants")
        .select("id, first_name, last_name, email")
        .eq("is_deleted", false)
        .order("last_name");
      setParticipants(data || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from("courses")
        .select("id, title, category")
        .eq("is_active", true)
        .order("title");
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const createCertificate = async () => {
    if (!newCertificate.participant_id || !newCertificate.title) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate certificate number
      const { data: certNumber, error: numError } = await supabase.rpc(
        "generate_certificate_number"
      );

      if (numError) throw numError;

      const { error } = await supabase.from("certificates").insert({
        certificate_number: certNumber,
        participant_id: newCertificate.participant_id,
        course_id: newCertificate.course_id || null,
        title: newCertificate.title,
        valid_until: newCertificate.valid_until || null,
        notes: newCertificate.notes || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zertifikat wurde erstellt.",
      });

      setCreateDialogOpen(false);
      setNewCertificate({
        participant_id: "",
        course_id: "",
        title: "",
        valid_until: "",
        notes: "",
      });
      fetchCertificates();
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Zertifikat konnte nicht erstellt werden.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({ 
          status: newStatus,
          issued_at: newStatus === "issued" ? new Date().toISOString() : undefined,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Status wurde aktualisiert.",
      });

      fetchCertificates();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    }
  };

  const getFilteredCertificates = () => {
    return certificates.filter((c) => {
      const participantName = c.participants
        ? `${c.participants.first_name} ${c.participants.last_name}`
        : "";
      const matchesSearch =
        searchQuery === "" ||
        participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredCertificates = getFilteredCertificates();

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
          <h1 className="text-2xl font-bold text-foreground">Zertifikate</h1>
          <p className="text-muted-foreground">
            {filteredCertificates.length} von {certificates.length} Zertifikate
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Zertifikat erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neues Zertifikat erstellen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Teilnehmer *</Label>
                <Select
                  value={newCertificate.participant_id}
                  onValueChange={(v) =>
                    setNewCertificate({ ...newCertificate, participant_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Teilnehmer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kurs (optional)</Label>
                <Select
                  value={newCertificate.course_id}
                  onValueChange={(v) =>
                    setNewCertificate({ ...newCertificate, course_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Titel / Bezeichnung *</Label>
                <Input
                  placeholder="z.B. Teilnahmebescheinigung BKF-Weiterbildung"
                  value={newCertificate.title}
                  onChange={(e) =>
                    setNewCertificate({ ...newCertificate, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Gültig bis (optional)</Label>
                <Input
                  type="date"
                  value={newCertificate.valid_until}
                  onChange={(e) =>
                    setNewCertificate({ ...newCertificate, valid_until: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Notizen</Label>
                <Input
                  placeholder="Interne Notizen"
                  value={newCertificate.notes}
                  onChange={(e) =>
                    setNewCertificate({ ...newCertificate, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createCertificate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Zertifikat erstellen"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name, Nummer oder Titel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ausgestellt</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificates.filter((c) => c.status === "issued").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificates.filter((c) => c.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nummer</TableHead>
                <TableHead>Teilnehmer</TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Ausgestellt</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Zertifikate gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">
                      {cert.certificate_number}
                    </TableCell>
                    <TableCell>
                      {cert.participants ? (
                        <div>
                          <div className="font-medium">
                            {cert.participants.first_name} {cert.participants.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {cert.participants.email}
                          </div>
                        </div>
                      ) : (
                        "–"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{cert.title}</div>
                      {cert.courses && (
                        <div className="text-sm text-muted-foreground capitalize">
                          {cert.courses.category}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(cert.issued_at), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell>
                      {cert.valid_until
                        ? format(new Date(cert.valid_until), "dd.MM.yyyy", { locale: de })
                        : "Unbegrenzt"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={cert.status}
                        onValueChange={(v) => updateStatus(cert.id, v)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={statusColors[cert.status]}>
                            {statusLabels[cert.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions
                            .filter((s) => s.value !== "all")
                            .map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {cert.pdf_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <FileUp className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
