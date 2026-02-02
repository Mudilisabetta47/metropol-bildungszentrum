import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Search, Download, Eye, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zip_city: string | null;
  date_of_birth: string | null;
  message: string | null;
  status: string;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  confirmation_sent_at: string | null;
  created_at: string;
  course_dates: {
    start_date: string;
    courses: { title: string };
    locations: { name: string };
  };
}

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "cancelled", label: "Storniert" },
  { value: "waitlist", label: "Warteliste" },
  { value: "completed", label: "Abgeschlossen" },
];

export default function Registrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          course_dates (
            start_date,
            courses (title),
            locations (name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data as unknown as Registration[]);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Anmeldungen konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "pending" | "confirmed" | "cancelled" | "waitlist" | "completed") => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Status wurde aktualisiert.",
      });
      
      fetchRegistrations();
      setSelectedRegistration(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const sendConfirmation = async (registration: Registration) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke("send-registration-confirmation", {
        body: {
          registrationId: registration.id,
          email: registration.email,
          firstName: registration.first_name,
          lastName: registration.last_name,
          courseName: registration.course_dates?.courses?.title,
          locationName: registration.course_dates?.locations?.name,
          startDate: registration.course_dates?.start_date,
        },
      });

      if (error) throw error;

      // Update confirmation_sent_at
      await supabase
        .from("registrations")
        .update({ 
          confirmation_sent_at: new Date().toISOString(),
          status: "confirmed" 
        })
        .eq("id", registration.id);

      toast({
        title: "Erfolg",
        description: "Bestätigung wurde gesendet.",
      });

      fetchRegistrations();
    } catch (error) {
      console.error("Error sending confirmation:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bestätigung konnte nicht gesendet werden.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Vorname",
      "Nachname",
      "E-Mail",
      "Telefon",
      "Kurs",
      "Standort",
      "Startdatum",
      "Status",
      "Quelle",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Angemeldet am",
    ];

    const filteredData = getFilteredRegistrations();
    const csvContent = [
      headers.join(";"),
      ...filteredData.map((reg) =>
        [
          reg.first_name,
          reg.last_name,
          reg.email,
          reg.phone || "",
          reg.course_dates?.courses?.title || "",
          reg.course_dates?.locations?.name || "",
          reg.course_dates?.start_date || "",
          reg.status,
          reg.source || "",
          reg.utm_source || "",
          reg.utm_medium || "",
          reg.utm_campaign || "",
          format(new Date(reg.created_at), "dd.MM.yyyy HH:mm"),
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `anmeldungen_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getFilteredRegistrations = () => {
    return registrations.filter((reg) => {
      const matchesSearch =
        searchQuery === "" ||
        `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || reg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      waitlist: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    const statusLabels: Record<string, string> = {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      cancelled: "Storniert",
      waitlist: "Warteliste",
      completed: "Abgeschlossen",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const filteredRegistrations = getFilteredRegistrations();

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
          <h1 className="text-2xl font-bold text-foreground">Anmeldungen</h1>
          <p className="text-muted-foreground">
            {filteredRegistrations.length} von {registrations.length} Anmeldungen
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          CSV Export
        </Button>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kurs</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Angemeldet</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Anmeldungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reg.first_name} {reg.last_name}</p>
                        <p className="text-sm text-muted-foreground">{reg.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{reg.course_dates?.courses?.title || "-"}</TableCell>
                    <TableCell>{reg.course_dates?.locations?.name || "-"}</TableCell>
                    <TableCell>
                      {reg.course_dates?.start_date
                        ? format(new Date(reg.course_dates.start_date), "dd.MM.yyyy", { locale: de })
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                    <TableCell>
                      {format(new Date(reg.created_at), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRegistration(reg)}
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
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anmeldung Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {selectedRegistration.first_name} {selectedRegistration.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-medium">{selectedRegistration.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedRegistration.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Geburtsdatum</p>
                  <p className="font-medium">
                    {selectedRegistration.date_of_birth
                      ? format(new Date(selectedRegistration.date_of_birth), "dd.MM.yyyy")
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">
                    {selectedRegistration.address || "-"}
                    {selectedRegistration.zip_city && `, ${selectedRegistration.zip_city}`}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Kurs</p>
                <p className="font-medium">{selectedRegistration.course_dates?.courses?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRegistration.course_dates?.locations?.name} • 
                  {selectedRegistration.course_dates?.start_date &&
                    format(new Date(selectedRegistration.course_dates.start_date), " dd.MM.yyyy", { locale: de })}
                </p>
              </div>

              {selectedRegistration.message && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Nachricht</p>
                  <p className="text-sm">{selectedRegistration.message}</p>
                </div>
              )}

              {(selectedRegistration.utm_source || selectedRegistration.utm_medium || selectedRegistration.utm_campaign) && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Tracking</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRegistration.source && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        Quelle: {selectedRegistration.source}
                      </span>
                    )}
                    {selectedRegistration.utm_source && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Source: {selectedRegistration.utm_source}
                      </span>
                    )}
                    {selectedRegistration.utm_medium && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Medium: {selectedRegistration.utm_medium}
                      </span>
                    )}
                    {selectedRegistration.utm_campaign && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Campaign: {selectedRegistration.utm_campaign}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendConfirmation(selectedRegistration)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Bestätigung senden
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedRegistration.id, "confirmed")}
                  disabled={isUpdating || selectedRegistration.status === "confirmed"}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bestätigen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedRegistration.id, "waitlist")}
                  disabled={isUpdating || selectedRegistration.status === "waitlist"}
                  className="text-blue-600"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Warteliste
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedRegistration.id, "cancelled")}
                  disabled={isUpdating || selectedRegistration.status === "cancelled"}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Stornieren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
