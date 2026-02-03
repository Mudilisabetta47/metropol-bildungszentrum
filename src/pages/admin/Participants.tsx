import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  UserPlus,
  Download,
  Eye,
  FileText,
  History,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  StickyNote,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zip_city: string | null;
  date_of_birth: string | null;
  status: string;
  internal_notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ParticipantHistory {
  id: string;
  action: string;
  details: unknown;
  created_at: string;
}

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "lead", label: "Interessent" },
  { value: "registered", label: "Angemeldet" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
  { value: "dropped", label: "Abgebrochen" },
];

const statusLabels: Record<string, string> = {
  lead: "Interessent",
  registered: "Angemeldet",
  confirmed: "Bestätigt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  dropped: "Abgebrochen",
};

const statusColors: Record<string, string> = {
  lead: "bg-gray-100 text-gray-800",
  registered: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
  dropped: "bg-orange-100 text-orange-800",
};

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [participantHistory, setParticipantHistory] = useState<ParticipantHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const { toast } = useToast();

  // Form state for new participant
  const [newParticipant, setNewParticipant] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    zip_city: "",
    date_of_birth: "",
    status: "lead",
    internal_notes: "",
    tags: "",
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (selectedParticipant) {
      setEditedNotes(selectedParticipant.internal_notes || "");
      fetchParticipantHistory(selectedParticipant.id);
    }
  }, [selectedParticipant]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Teilnehmer konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipantHistory = async (participantId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("participant_history")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipantHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const createParticipant = async () => {
    if (!newParticipant.first_name || !newParticipant.last_name || !newParticipant.email) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("participants").insert({
        first_name: newParticipant.first_name,
        last_name: newParticipant.last_name,
        email: newParticipant.email,
        phone: newParticipant.phone || null,
        address: newParticipant.address || null,
        zip_city: newParticipant.zip_city || null,
        date_of_birth: newParticipant.date_of_birth || null,
        status: newParticipant.status,
        internal_notes: newParticipant.internal_notes || null,
        tags: newParticipant.tags ? newParticipant.tags.split(",").map((t) => t.trim()) : [],
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Teilnehmer wurde angelegt.",
      });

      setCreateDialogOpen(false);
      setNewParticipant({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        zip_city: "",
        date_of_birth: "",
        status: "lead",
        internal_notes: "",
        tags: "",
      });
      fetchParticipants();
    } catch (error) {
      console.error("Error creating participant:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Teilnehmer konnte nicht angelegt werden.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedParticipant) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from("participants")
        .update({ internal_notes: editedNotes })
        .eq("id", selectedParticipant.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Notizen wurden gespeichert.",
      });

      // Update local state
      setSelectedParticipant({ ...selectedParticipant, internal_notes: editedNotes });
      fetchParticipants();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Notizen konnten nicht gespeichert werden.",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedParticipant) return;

    try {
      const { error } = await supabase
        .from("participants")
        .update({ status: newStatus })
        .eq("id", selectedParticipant.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Status wurde aktualisiert.",
      });

      setSelectedParticipant({ ...selectedParticipant, status: newStatus });
      fetchParticipants();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Vorname",
      "Nachname",
      "E-Mail",
      "Telefon",
      "Adresse",
      "PLZ/Ort",
      "Geburtsdatum",
      "Status",
      "Tags",
      "Erstellt am",
    ];

    const filteredData = getFilteredParticipants();
    const csvContent = [
      headers.join(";"),
      ...filteredData.map((p) =>
        [
          p.first_name,
          p.last_name,
          p.email,
          p.phone || "",
          p.address || "",
          p.zip_city || "",
          p.date_of_birth || "",
          statusLabels[p.status] || p.status,
          (p.tags || []).join(", "),
          format(new Date(p.created_at), "dd.MM.yyyy"),
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `teilnehmer_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getFilteredParticipants = () => {
    return participants.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredParticipants = getFilteredParticipants();

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
          <h1 className="text-2xl font-bold text-foreground">Teilnehmer</h1>
          <p className="text-muted-foreground">
            {filteredParticipants.length} von {participants.length} Teilnehmer
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Teilnehmer anlegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neuen Teilnehmer anlegen</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vorname *</Label>
                  <Input
                    value={newParticipant.first_name}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nachname *</Label>
                  <Input
                    value={newParticipant.last_name}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, last_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-Mail *</Label>
                  <Input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    value={newParticipant.phone}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    value={newParticipant.address}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>PLZ / Ort</Label>
                  <Input
                    value={newParticipant.zip_city}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, zip_city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geburtsdatum</Label>
                  <Input
                    type="date"
                    value={newParticipant.date_of_birth}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, date_of_birth: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newParticipant.status}
                    onValueChange={(v) => setNewParticipant({ ...newParticipant, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter((s) => s.value !== "all").map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Tags (kommagetrennt)</Label>
                  <Input
                    placeholder="BKF, Bus, VIP"
                    value={newParticipant.tags}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, tags: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Interne Notizen</Label>
                  <Textarea
                    rows={3}
                    value={newParticipant.internal_notes}
                    onChange={(e) =>
                      setNewParticipant({ ...newParticipant, internal_notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={createParticipant} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird angelegt...
                    </>
                  ) : (
                    "Teilnehmer anlegen"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name oder E-Mail suchen..."
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

      {/* Participants Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Teilnehmer gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="font-medium">
                        {participant.first_name} {participant.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{participant.email}</div>
                        {participant.phone && (
                          <div className="text-muted-foreground">{participant.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[participant.status]}>
                        {statusLabels[participant.status] || participant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(participant.tags || []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(participant.tags || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(participant.tags || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(participant.created_at), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedParticipant?.first_name} {selectedParticipant?.last_name}
            </DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList>
                <TabsTrigger value="info">Infos</TabsTrigger>
                <TabsTrigger value="notes">Notizen</TabsTrigger>
                <TabsTrigger value="documents">Dokumente</TabsTrigger>
                <TabsTrigger value="history">Historie</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedParticipant.email}</span>
                  </div>
                  {selectedParticipant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedParticipant.phone}</span>
                    </div>
                  )}
                  {selectedParticipant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedParticipant.address}
                        {selectedParticipant.zip_city && `, ${selectedParticipant.zip_city}`}
                      </span>
                    </div>
                  )}
                  {selectedParticipant.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(selectedParticipant.date_of_birth), "dd.MM.yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Label className="mb-2 block">Status</Label>
                  <Select value={selectedParticipant.status} onValueChange={updateStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter((s) => s.value !== "all").map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedParticipant.tags && selectedParticipant.tags.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipant.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <StickyNote className="h-4 w-4" />
                    <span className="text-sm">Interne Notizen (nur für Mitarbeiter sichtbar)</span>
                  </div>
                  <Textarea
                    rows={8}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Notizen zu diesem Teilnehmer..."
                  />
                  <Button onClick={saveNotes} disabled={isSavingNotes}>
                    {isSavingNotes ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      "Notizen speichern"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="pt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Dokumenten-Upload kommt bald</p>
                  <p className="text-sm">Hier können Sie Ausweise, Zertifikate etc. hochladen</p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : participantHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Historie vorhanden</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participantHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <History className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
