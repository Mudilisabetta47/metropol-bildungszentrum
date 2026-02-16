import React, { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Loader2, Copy, ChevronDown, ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { CapacityBadge } from "@/components/ui/capacity-badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CourseCapacityInfo {
  totalMax: number;
  totalCurrent: number;
  upcomingDates: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  duration_info: string | null;
  price: number | null;
  price_info: string | null;
  requirements: string | null;
  benefits: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface CourseDateInfo {
  id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  locations: { name: string } | null;
}

const categories = [
  { value: "lkw", label: "LKW" },
  { value: "bus", label: "Bus" },
  { value: "fahrlehrer", label: "Fahrlehrer" },
  { value: "bkf", label: "BKF-Weiterbildung" },
  { value: "sprache", label: "Sprachkurse" },
  { value: "sonstige", label: "Sonstige" },
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCapacity, setCourseCapacity] = useState<Record<string, CourseCapacityInfo>>({});
  const [courseDatesMap, setCourseDatesMap] = useState<Record<string, CourseDateInfo[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "lkw",
    duration_info: "",
    price_info: "",
    requirements: "",
    benefits: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
    fetchCourseCapacity();
  }, []);

  const fetchCourseCapacity = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("course_dates")
        .select("course_id, max_participants, current_participants")
        .eq("is_active", true)
        .gte("start_date", today);

      if (error) throw error;

      const capacityMap: Record<string, CourseCapacityInfo> = {};
      (data || []).forEach((cd) => {
        if (!capacityMap[cd.course_id]) {
          capacityMap[cd.course_id] = { totalMax: 0, totalCurrent: 0, upcomingDates: 0 };
        }
        capacityMap[cd.course_id].totalMax += cd.max_participants;
        capacityMap[cd.course_id].totalCurrent += cd.current_participants;
        capacityMap[cd.course_id].upcomingDates += 1;
      });

      setCourseCapacity(capacityMap);
    } catch (error) {
      console.error("Error fetching course capacity:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kurse konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = async (courseId: string) => {
    const next = new Set(expandedCourses);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
      if (!courseDatesMap[courseId]) {
        try {
          const { data, error } = await supabase
            .from("course_dates")
            .select("id, start_date, end_date, start_time, end_time, max_participants, current_participants, is_active, locations(name)")
            .eq("course_id", courseId)
            .order("start_date", { ascending: true });

          if (error) throw error;
          setCourseDatesMap((prev) => ({ ...prev, [courseId]: (data || []) as CourseDateInfo[] }));
        } catch (error) {
          console.error("Error fetching course dates:", error);
        }
      }
    }
    setExpandedCourses(next);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        slug: course.slug,
        description: course.description || "",
        category: course.category,
        duration_info: course.duration_info || "",
        price_info: course.price_info || "",
        requirements: course.requirements || "",
        benefits: course.benefits?.join("\n") || "",
        is_active: course.is_active,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        category: "lkw",
        duration_info: "",
        price_info: "",
        requirements: "",
        benefits: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const courseData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        category: formData.category as any,
        duration_info: formData.duration_info || null,
        price_info: formData.price_info || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits ? formData.benefits.split("\n").filter(Boolean) : null,
        is_active: formData.is_active,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Kurs wurde aktualisiert.",
        });
      } else {
        // Create the course
        const { data: newCourse, error } = await supabase
          .from("courses")
          .insert(courseData)
          .select()
          .single();

        if (error) throw error;

        // Automatically create a sample course date for the new course
        // Get the first active location
        const { data: locations } = await supabase
          .from("locations")
          .select("id")
          .eq("is_active", true)
          .limit(1);

        if (locations && locations.length > 0 && newCourse) {
          // Create a course date starting 2 weeks from now
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + 14);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 21); // 3 weeks duration

          await supabase.from("course_dates").insert({
            course_id: newCourse.id,
            location_id: locations[0].id,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            start_time: "08:00",
            end_time: "16:00",
            max_participants: 20,
            is_active: true,
            notes: "Automatisch erstellter Termin - bitte anpassen",
          });
        }

        toast({
          title: "Erfolg",
          description: "Kurs und Beispieltermin wurden erstellt.",
        });
      }

      setIsDialogOpen(false);
      fetchCourses();
      fetchCourseCapacity();
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Kurs konnte nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Kurs wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kurs wurde gelöscht.",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kurs konnte nicht gelöscht werden.",
      });
    }
  };

  const handleDuplicate = async (course: Course) => {
    try {
      const newSlug = `${course.slug}-kopie-${Date.now().toString(36)}`;
      const { error } = await supabase.from("courses").insert({
        title: `${course.title} (Kopie)`,
        slug: newSlug,
        description: course.description,
        category: course.category as any,
        duration_info: course.duration_info,
        price_info: course.price_info,
        requirements: course.requirements,
        benefits: course.benefits,
        is_active: false,
      });

      if (error) throw error;

      toast({ title: "Erfolg", description: "Kurs wurde dupliziert." });
      fetchCourses();
    } catch (error: any) {
      console.error("Error duplicating course:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Kurs konnte nicht dupliziert werden.",
      });
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
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
          <h1 className="text-2xl font-bold text-foreground">Kurse</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Kursangebote</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Kurs erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Kurs bearbeiten" : "Neuer Kurs"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="z.B. Führerschein C/CE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="fuehrerschein-c-ce"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_info">Dauer</Label>
                  <Input
                    id="duration_info"
                    value={formData.duration_info}
                    onChange={(e) => setFormData({ ...formData, duration_info: e.target.value })}
                    placeholder="z.B. 2-4 Wochen"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kurze Beschreibung des Kurses..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_info">Preisinformation</Label>
                <Input
                  id="price_info"
                  value={formData.price_info}
                  onChange={(e) => setFormData({ ...formData, price_info: e.target.value })}
                  placeholder="z.B. Auf Anfrage / Förderfähig"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Voraussetzungen</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="z.B. Führerschein Klasse B, Mindestalter 18 Jahre"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Vorteile (eine pro Zeile)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="AZAV-zertifiziert&#10;100% Förderung möglich&#10;Moderne Fahrzeuge"
                  rows={4}
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
                <Label htmlFor="is_active">Kurs ist aktiv</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button variant="accent" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCourse ? "Speichern" : "Erstellen"}
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
                <TableHead className="w-10"></TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Auslastung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Noch keine Kurse vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => {
                  const capacity = courseCapacity[course.id];
                  const isExpanded = expandedCourses.has(course.id);
                  const dates = courseDatesMap[course.id] || [];
                  return (
                    <React.Fragment key={course.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpanded(course.id)}>
                        <TableCell className="w-10 px-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{getCategoryLabel(course.category)}</TableCell>
                        <TableCell>{course.duration_info || "-"}</TableCell>
                        <TableCell>
                          {capacity ? (
                            <div className="flex flex-col gap-1">
                              <CapacityBadge 
                                current={capacity.totalCurrent} 
                                max={capacity.totalMax} 
                                size="sm"
                              />
                              <span className="text-xs text-muted-foreground">
                                {capacity.upcomingDates} Termin{capacity.upcomingDates !== 1 ? 'e' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Keine Termine</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.is_active
                                ? "bg-accent/20 text-accent-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {course.is_active ? "Aktiv" : "Inaktiv"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(course)} title="Kurs duplizieren">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <div className="px-6 py-3">
                              {dates.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">Keine Termine für diesen Kurs angelegt.</p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Termine ({dates.length})</p>
                                  {dates.map((cd) => (
                                    <div key={cd.id} className="flex items-center gap-4 text-sm bg-background rounded-md px-3 py-2 border">
                                      <div className="flex items-center gap-1.5 min-w-[140px]">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{format(new Date(cd.start_date), "dd.MM.yyyy", { locale: de })}</span>
                                        {cd.end_date && cd.end_date !== cd.start_date && (
                                          <span className="text-muted-foreground">– {format(new Date(cd.end_date), "dd.MM.yyyy", { locale: de })}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 min-w-[80px] text-muted-foreground">
                                        {cd.start_time ? cd.start_time.slice(0, 5) : "–"}
                                        {cd.end_time && ` – ${cd.end_time.slice(0, 5)}`}
                                      </div>
                                      <div className="flex items-center gap-1.5 min-w-[120px]">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{cd.locations?.name || "–"}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{cd.current_participants}/{cd.max_participants}</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cd.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                                        {cd.is_active ? "Aktiv" : "Inaktiv"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
