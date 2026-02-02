import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone, Mail } from "lucide-react";

interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  zip_city: string;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  map_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    zip_city: "",
    phone: "",
    email: "",
    opening_hours: "",
    map_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Standorte konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        slug: location.slug,
        address: location.address,
        zip_city: location.zip_city,
        phone: location.phone || "",
        email: location.email || "",
        opening_hours: location.opening_hours || "",
        map_url: location.map_url || "",
        is_active: location.is_active,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        slug: "",
        address: "",
        zip_city: "",
        phone: "",
        email: "",
        opening_hours: "",
        map_url: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.zip_city.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const locationData = {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        zip_city: formData.zip_city,
        phone: formData.phone || null,
        email: formData.email || null,
        opening_hours: formData.opening_hours || null,
        map_url: formData.map_url || null,
        is_active: formData.is_active,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingLocation.id);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Standort wurde aktualisiert.",
        });
      } else {
        const { error } = await supabase.from("locations").insert(locationData);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Standort wurde erstellt.",
        });
      }

      setIsDialogOpen(false);
      fetchLocations();
    } catch (error: any) {
      console.error("Error saving location:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Standort konnte nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Standort wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Standort wurde gelöscht.",
      });
      fetchLocations();
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Standort konnte nicht gelöscht werden.",
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
          <h1 className="text-2xl font-bold text-foreground">Standorte</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Schulungsstandorte</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Standort erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Standort bearbeiten" : "Neuer Standort"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="z.B. Hannover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="hannover"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Beispielstraße 123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_city">PLZ & Stadt *</Label>
                <Input
                  id="zip_city"
                  value={formData.zip_city}
                  onChange={(e) => setFormData({ ...formData, zip_city: e.target.value })}
                  placeholder="30159 Hannover"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0511 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="standort@beispiel.de"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_hours">Öffnungszeiten</Label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  placeholder="Mo-Fr: 8:00 - 18:00 Uhr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_url">Google Maps Embed URL</Label>
                <Textarea
                  id="map_url"
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
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
                <Label htmlFor="is_active">Standort ist aktiv</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button variant="accent" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingLocation ? "Speichern" : "Erstellen"}
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
                <TableHead>Name</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Noch keine Standorte vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {location.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{location.address}</p>
                        <p className="text-muted-foreground">{location.zip_city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {location.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {location.phone}
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {location.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {location.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
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
