import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, User, Mail, MapPin, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ParticipantSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zip_city: string | null;
  status: string;
  user_id: string | null;
  latestCourse?: string;
  latestLocation?: string;
}

interface ParticipantSearchProps {
  onSelect: (participant: ParticipantSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function ParticipantSearch({
  onSelect,
  placeholder = "Teilnehmer suchen (Name oder E-Mail)...",
  className,
}: ParticipantSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ParticipantSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Search participants with their latest registration info
        const { data, error } = await supabase
          .from("participants")
          .select(`
            id, first_name, last_name, email, phone, address, zip_city, status, user_id
          `)
          .eq("is_deleted", false)
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
          .order("last_name", { ascending: true })
          .limit(10);

        if (error) throw error;

        // Get latest course for each participant
        const participantsWithCourses = await Promise.all(
          (data || []).map(async (p) => {
            const { data: regData } = await supabase
              .from("registrations")
              .select(`
                course_dates (
                  courses (title),
                  locations (name)
                )
              `)
              .eq("email", p.email)
              .eq("is_deleted", false)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              ...p,
              latestCourse: regData?.course_dates?.courses?.title,
              latestLocation: regData?.course_dates?.locations?.name,
            } as ParticipantSearchResult;
          })
        );

        setResults(participantsWithCourses);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 200); // Fast debounce for instant feel

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (participant: ParticipantSearchResult) => {
    onSelect(participant);
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const statusLabels: Record<string, string> = {
    lead: "Interessent",
    active: "Aktiv",
    confirmed: "Bestätigt",
    completed: "Abgeschlossen",
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto shadow-lg border">
          <div className="p-1">
            {results.map((participant, index) => (
              <button
                key={participant.id}
                onClick={() => handleSelect(participant)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-colors",
                  "hover:bg-muted focus:bg-muted focus:outline-none",
                  selectedIndex === index && "bg-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">
                        {participant.first_name} {participant.last_name}
                      </span>
                      {participant.user_id && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Portal
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{participant.email}</span>
                    </div>
                    {(participant.latestCourse || participant.latestLocation) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {participant.latestCourse && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {participant.latestCourse}
                          </span>
                        )}
                        {participant.latestLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {participant.latestLocation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge className={cn("text-xs flex-shrink-0", getStatusColor(participant.status))}>
                    {statusLabels[participant.status] || participant.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <div className="p-4 text-center text-sm text-muted-foreground">
            Keine Teilnehmer gefunden für "{query}"
          </div>
        </Card>
      )}
    </div>
  );
}
