import { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Search } from "lucide-react";
import {
  useServiceCategories,
  useServiceItems,
  type ServiceItem,
} from "@/hooks/useServiceCatalog";

interface ServiceItemPickerProps {
  onSelect: (item: ServiceItem) => void;
}

export function ServiceItemPicker({ onSelect }: ServiceItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: categories } = useServiceCategories(true);
  const { data: items } = useServiceItems(true);

  const grouped = useMemo(() => {
    if (!items) return [];
    const filtered = search
      ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      : items;
    const map = new Map<string, ServiceItem[]>();
    filtered.forEach((it) => {
      const key = it.category_id || "uncat";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return Array.from(map.entries()).map(([catId, its]) => ({
      category: categories?.find((c) => c.id === catId),
      items: its,
    }));
  }, [items, categories, search]);

  const currency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Package className="mr-2 h-4 w-4" />
          Aus Katalog wählen
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Leistung suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-80">
          {grouped.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Keine Leistungen gefunden.
            </div>
          ) : (
            grouped.map(({ category, items: its }) => (
              <div key={category?.id || "uncat"} className="py-2">
                <div className="px-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {category?.name || "Ohne Kategorie"}
                </div>
                {its.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between gap-3"
                    onClick={() => {
                      onSelect(it);
                      setOpen(false);
                    }}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{it.name}</div>
                      {it.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {it.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {currency(it.unit_price)}
                    </Badge>
                  </button>
                ))}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
