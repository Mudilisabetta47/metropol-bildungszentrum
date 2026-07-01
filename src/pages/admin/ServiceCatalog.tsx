import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useServiceCategories,
  useServiceItems,
  useSaveCategory,
  useSaveServiceItem,
  useDeleteCategory,
  useDeleteServiceItem,
  type ServiceCategory,
  type ServiceItem,
} from "@/hooks/useServiceCatalog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Package, Folder } from "lucide-react";

export default function ServiceCatalog() {
  const { data: categories, isLoading: catLoading } = useServiceCategories();
  const { data: items, isLoading: itemsLoading } = useServiceItems();
  const saveCat = useSaveCategory();
  const saveItem = useSaveServiceItem();
  const delCat = useDeleteCategory();
  const delItem = useDeleteServiceItem();
  const { toast } = useToast();

  const [editingCat, setEditingCat] = useState<Partial<ServiceCategory> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);

  const currency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const handleSaveCat = async () => {
    if (!editingCat?.name?.trim()) return;
    try {
      await saveCat.mutateAsync(editingCat as ServiceCategory & { name: string });
      toast({ title: "Kategorie gespeichert" });
      setEditingCat(null);
    } catch {
      toast({ variant: "destructive", title: "Fehler" });
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem?.name?.trim()) return;
    try {
      await saveItem.mutateAsync(editingItem as ServiceItem & { name: string });
      toast({ title: "Leistung gespeichert" });
      setEditingItem(null);
    } catch {
      toast({ variant: "destructive", title: "Fehler" });
    }
  };

  if (catLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leistungskatalog</h1>
        <p className="text-muted-foreground">
          Verwalte wiederverwendbare Positionen für Rechnungen und Kostenvoranschläge.
        </p>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" /> Kategorien
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setEditingCat({ name: "", sort_order: 0, is_active: true })}
          >
            <Plus className="mr-2 h-4 w-4" /> Neue Kategorie
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sortierung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(categories || []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell>
                    {c.is_active ? (
                      <Badge>Aktiv</Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCat(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Kategorie löschen?")) delCat.mutate(c.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Leistungen
          </CardTitle>
          <Button
            size="sm"
            onClick={() =>
              setEditingItem({
                name: "",
                unit: "Stück",
                unit_price: 0,
                is_active: true,
                sort_order: 0,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Neue Leistung
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Einheit</TableHead>
                <TableHead className="text-right">Preis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items || []).map((it) => (
                <TableRow key={it.id}>
                  <TableCell>
                    <div className="font-medium">{it.name}</div>
                    {it.description && (
                      <div className="text-xs text-muted-foreground">{it.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === it.category_id)?.name || "-"}
                  </TableCell>
                  <TableCell>{it.unit}</TableCell>
                  <TableCell className="text-right">{currency(Number(it.unit_price))}</TableCell>
                  <TableCell>
                    {it.is_active ? (
                      <Badge>Aktiv</Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingItem(it)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Leistung löschen?")) delItem.mutate(it.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category dialog */}
      <Dialog open={!!editingCat} onOpenChange={(o) => !o && setEditingCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat?.id ? "Kategorie bearbeiten" : "Neue Kategorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editingCat?.name || ""}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={editingCat?.description || ""}
                onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={editingCat?.sort_order ?? 0}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={editingCat?.is_active ?? true}
                  onCheckedChange={(v) => setEditingCat({ ...editingCat, is_active: v })}
                />
                <Label>Aktiv</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCat(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveCat} disabled={saveCat.isPending}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? "Leistung bearbeiten" : "Neue Leistung"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editingItem?.name || ""}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={editingItem?.description || ""}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={editingItem?.category_id || "none"}
                onValueChange={(v) =>
                  setEditingItem({ ...editingItem, category_id: v === "none" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ohne Kategorie</SelectItem>
                  {(categories || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Input
                  value={editingItem?.unit || "Stück"}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Einzelpreis (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem?.unit_price ?? 0}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      unit_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={editingItem?.sort_order ?? 0}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={editingItem?.is_active ?? true}
                  onCheckedChange={(v) => setEditingItem({ ...editingItem, is_active: v })}
                />
                <Label>Aktiv</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveItem} disabled={saveItem.isPending}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
