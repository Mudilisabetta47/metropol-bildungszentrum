import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  Receipt,
  GraduationCap,
  Calendar,
  MapPin,
  BarChart3,
  Settings,
  MessageSquare,
  LayoutDashboard,
  CreditCard,
  Award,
  Search,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Teilnehmer", href: "/admin/participants", icon: Users },
  { label: "Kurse", href: "/admin/courses", icon: GraduationCap },
  { label: "Termine", href: "/admin/schedule", icon: Calendar },
  { label: "Anmeldungen", href: "/admin/registrations", icon: Users },
  { label: "Rechnungen", href: "/admin/invoices", icon: Receipt },
  { label: "Zertifikate", href: "/admin/certificates", icon: Award },
  { label: "Zahlungen", href: "/admin/payments", icon: CreditCard },
  { label: "Kontaktanfragen", href: "/admin/contacts", icon: MessageSquare },
  { label: "Statistiken", href: "/admin/statistics", icon: BarChart3 },
  { label: "Standorte", href: "/admin/locations", icon: MapPin },
  { label: "Einstellungen", href: "/admin/settings", icon: Settings },
];

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: "participant" | "invoice" | "course";
  href: string;
}

export function AdminCommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const [participants, invoices, courses] = await Promise.all([
        supabase
          .from("participants")
          .select("id, first_name, last_name, email")
          .eq("is_deleted", false)
          .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("invoices")
          .select("id, invoice_number, recipient_name")
          .eq("is_deleted", false)
          .or(`invoice_number.ilike.%${q}%,recipient_name.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("courses")
          .select("id, title, slug")
          .ilike("title", `%${q}%`)
          .limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(participants.data || []).map((p) => ({
          id: p.id,
          label: `${p.first_name} ${p.last_name}`,
          sublabel: p.email,
          type: "participant" as const,
          href: `/admin/participants`,
        })),
        ...(invoices.data || []).map((i) => ({
          id: i.id,
          label: i.invoice_number,
          sublabel: i.recipient_name,
          type: "invoice" as const,
          href: `/admin/invoices`,
        })),
        ...(courses.data || []).map((c) => ({
          id: c.id,
          label: c.title,
          type: "course" as const,
          href: `/admin/courses`,
        })),
      ];
      setResults(mapped);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Suche...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Teilnehmer, Rechnungen, Kurse suchen..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Suche..." : "Keine Ergebnisse gefunden."}
          </CommandEmpty>

          {results.filter((r) => r.type === "participant").length > 0 && (
            <CommandGroup heading="Teilnehmer">
              {results
                .filter((r) => r.type === "participant")
                .map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <span>{r.label}</span>
                      {r.sublabel && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {r.sublabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {results.filter((r) => r.type === "invoice").length > 0 && (
            <CommandGroup heading="Rechnungen">
              {results
                .filter((r) => r.type === "invoice")
                .map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <span>{r.label}</span>
                      {r.sublabel && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {r.sublabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {results.filter((r) => r.type === "course").length > 0 && (
            <CommandGroup heading="Kurse">
              {results
                .filter((r) => r.type === "course")
                .map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{r.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Navigation">
            {navItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
