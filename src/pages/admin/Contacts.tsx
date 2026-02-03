import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Eye, Mail, Archive, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  course_interest: string | null;
  location_preference: string | null;
  is_read: boolean;
  is_archived: boolean;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface CourseDate {
  id: string;
  start_date: string;
  courses: { title: string } | null;
  locations: { name: string } | null;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [courseDates, setCourseDates] = useState<CourseDate[]>([]);
  const [selectedCourseDate, setSelectedCourseDate] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchCourseDates();
  }, [showArchived]);

  const fetchContacts = async () => {
    try {
      let query = supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!showArchived) {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kontaktanfragen konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseDates = async () => {
    try {
      const { data, error } = await supabase
        .from("course_dates")
        .select("id, start_date, courses(title), locations(name)")
        .eq("is_active", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true });

      if (error) throw error;
      setCourseDates(data || []);
    } catch (error) {
      console.error("Error fetching course dates:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const archiveContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({ is_archived: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Anfrage wurde archiviert.",
      });
      fetchContacts();
      setSelectedContact(null);
    } catch (error) {
      console.error("Error archiving contact:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Anfrage konnte nicht archiviert werden.",
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Möchten Sie diese Anfrage wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("contact_requests").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Anfrage wurde gelöscht.",
      });
      fetchContacts();
      setSelectedContact(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Anfrage konnte nicht gelöscht werden.",
      });
    }
  };

  const openContactDetail = (contact: ContactRequest) => {
    setSelectedContact(contact);
    if (!contact.is_read) {
      markAsRead(contact.id);
    }
  };

  const openConvertDialog = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setShowConvertDialog(true);
  };

  const convertToRegistration = async () => {
    if (!selectedContact || !selectedCourseDate) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie einen Kurstermin aus.",
      });
      return;
    }

    setIsConverting(true);
    try {
      // Split name into first and last name
      const nameParts = selectedContact.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Create registration
      const { error: regError } = await supabase.from("registrations").insert({
        first_name: firstName,
        last_name: lastName,
        email: selectedContact.email,
        phone: selectedContact.phone,
        course_date_id: selectedCourseDate,
        status: "confirmed",
        message: selectedContact.message,
        source: selectedContact.source,
        utm_source: selectedContact.utm_source,
        utm_medium: selectedContact.utm_medium,
        utm_campaign: selectedContact.utm_campaign,
      });

      if (regError) throw regError;

      // Archive the contact request
      const { error: archiveError } = await supabase
        .from("contact_requests")
        .update({ is_archived: true })
        .eq("id", selectedContact.id);

      if (archiveError) throw archiveError;

      toast({
        title: "Erfolg!",
        description: "Kontaktanfrage wurde zu einer bestätigten Anmeldung umgewandelt.",
      });

      setShowConvertDialog(false);
      setSelectedContact(null);
      setSelectedCourseDate("");
      fetchContacts();
    } catch (error) {
      console.error("Error converting to registration:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Konnte nicht zu Anmeldung umgewandelt werden.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const getFilteredContacts = () => {
    return contacts.filter((contact) => {
      const matchesSearch =
        searchQuery === "" ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  };

  const filteredContacts = getFilteredContacts();
  const unreadCount = contacts.filter((c) => !c.is_read).length;

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
          <h1 className="text-2xl font-bold text-foreground">Kontaktanfragen</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 && <span className="text-primary font-medium">{unreadCount} ungelesen • </span>}
            {filteredContacts.length} Anfragen
          </p>
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="mr-2 h-4 w-4" />
          {showArchived ? "Aktive anzeigen" : "Archiv anzeigen"}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Kursinteresse</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Keine Kontaktanfragen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    className={!contact.is_read ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!contact.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.subject || "-"}</TableCell>
                    <TableCell>{contact.course_interest || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openContactDetail(contact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveContact(contact.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kontaktanfrage</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedContact.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="font-medium">
                    {format(new Date(selectedContact.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </p>
                </div>
                {selectedContact.course_interest && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kursinteresse</p>
                    <p className="font-medium">{selectedContact.course_interest}</p>
                  </div>
                )}
                {selectedContact.location_preference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Standort</p>
                    <p className="font-medium">{selectedContact.location_preference}</p>
                  </div>
                )}
              </div>

              {selectedContact.subject && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Betreff</p>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Nachricht</p>
                <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              {(selectedContact.utm_source || selectedContact.utm_medium || selectedContact.utm_campaign) && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Tracking</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedContact.source && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        Quelle: {selectedContact.source}
                      </span>
                    )}
                    {selectedContact.utm_source && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Source: {selectedContact.utm_source}
                      </span>
                    )}
                    {selectedContact.utm_medium && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Medium: {selectedContact.utm_medium}
                      </span>
                    )}
                    {selectedContact.utm_campaign && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        UTM Campaign: {selectedContact.utm_campaign}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex flex-wrap gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => openConvertDialog(selectedContact)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Bezahlt → Anmeldung
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${selectedContact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Antworten
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveContact(selectedContact.id)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteContact(selectedContact.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert to Registration Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={(open) => {
        setShowConvertDialog(open);
        if (!open) {
          setSelectedCourseDate("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zu Anmeldung umwandeln</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedContact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                {selectedContact.course_interest && (
                  <p className="text-sm text-primary mt-1">Interesse: {selectedContact.course_interest}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-date">Kurstermin auswählen</Label>
                <Select value={selectedCourseDate} onValueChange={setSelectedCourseDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kurstermin wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courseDates.map((cd) => (
                      <SelectItem key={cd.id} value={cd.id}>
                        {cd.courses?.title} – {format(new Date(cd.start_date), "dd.MM.yyyy", { locale: de })} ({cd.locations?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={convertToRegistration} 
                  disabled={!selectedCourseDate || isConverting}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird umgewandelt...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Als bestätigt speichern
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
