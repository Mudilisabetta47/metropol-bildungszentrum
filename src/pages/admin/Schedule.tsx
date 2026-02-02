import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CourseDate {
  id: string;
  course_id: string;
  location_id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  notes: string | null;
  courses: { title: string };
  locations: { name: string };
}

interface Course {
  id: string;
  title: string;
}

interface Location {
  id: string;
  name: string;
}

export default function Schedule() {
  const [courseDates, setCourseDates] = useState<CourseDate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourseDate, setEditingCourseDate] = useState<CourseDate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    course_id: "",
    location_id: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    max_participants: 20,
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courseDatesRes, coursesRes, locationsRes] = await Promise.all([
        supabase
          .from("course_dates")
          .select(`
            *,
            courses (title),
            locations (name)
          `)
          .order("start_date", { ascending: true }),
        supabase.from("courses").select("id, title").eq("is_active", true),
        supabase.from("locations").select("id, name").eq("is_active", true),
      ]);

      if (courseDatesRes.error) throw courseDatesRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (locationsRes.error) throw locationsRes.error;

      setCourseDates(courseDatesRes.data as CourseDate[]);
      setCourses(coursesRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (courseDate?: CourseDate) => {
    if (courseDate) {
      setEditingCourseDate(courseDate);
      setFormData({
        course_id: courseDate.course_id,
        location_id: courseDate.location_id,
        start_date: courseDate.start_date,
        end_date: courseDate.end_date || "",
        start_time: courseDate.start_time || "",
        end_time: courseDate.end_time || "",
        max_participants: courseDate.max_participants,
        notes: courseDate.notes || "",
        is_active: courseDate.is_active,
      });
    } else {
      setEditingCourseDate(null);
      setFormData({
        course_id: "",
        location_id: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        max_participants: 20,
        notes: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.course_id || !formData.location_id || !formData.start_date) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const courseDateData = {
        course_id: formData.course_id,
        location_id: formData.location_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        max_participants: formData.max_participants,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      if (editingCourseDate) {
        const { error } = await supabase
          .from("course_dates")
          .update(courseDateData)
          .eq("id", editingCourseDate.id);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Termin wurde aktualisiert.",
        });
      } else {
        const { error } = await supabase.from("course_dates").insert(courseDateData);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Termin wurde erstellt.",
        });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving course date:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Termin konnte nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Termin wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("course_dates").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Termin wurde gelöscht.",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting course date:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden.",
      });
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Termine</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Kurstermine</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Termin erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCourseDate ? "Termin bearbeiten" : "Neuer Termin"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course_id">Kurs *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kurs wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_id">Standort *</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Standort wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Startdatum *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Enddatum</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Startzeit</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Endzeit</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Max. Teilnehmer</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 20 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interne Notizen zum Termin..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active">Termin ist aktiv</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button variant="accent" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCourseDate ? "Speichern" : "Erstellen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kurs</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Uhrzeit</TableHead>
                <TableHead>Teilnehmer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseDates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Noch keine Termine vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                courseDates.map((courseDate) => (
                  <TableRow key={courseDate.id}>
                    <TableCell className="font-medium">
                      {courseDate.courses?.title || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {courseDate.locations?.name || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(courseDate.start_date), "dd.MM.yyyy", { locale: de })}
                        {courseDate.end_date && courseDate.end_date !== courseDate.start_date && (
                          <> - {format(new Date(courseDate.end_date), "dd.MM.yyyy", { locale: de })}</>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {courseDate.start_time ? `${courseDate.start_time.slice(0, 5)}` : "-"}
                      {courseDate.end_time && ` - ${courseDate.end_time.slice(0, 5)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {courseDate.current_participants} / {courseDate.max_participants}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          courseDate.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {courseDate.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(courseDate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(courseDate.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
