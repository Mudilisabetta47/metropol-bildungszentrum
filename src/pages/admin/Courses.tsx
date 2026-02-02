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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

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
  }, []);

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
        const { error } = await supabase.from("courses").insert(courseData);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Kurs wurde erstellt.",
        });
      }

      setIsDialogOpen(false);
      fetchCourses();
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
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Noch keine Kurse vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{getCategoryLabel(course.category)}</TableCell>
                    <TableCell>{course.duration_info || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(course)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
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
