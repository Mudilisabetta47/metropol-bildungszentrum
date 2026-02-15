import { useState } from "react";
import { Bug, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const location = useLocation();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Bitte Titel und Beschreibung ausfüllen");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-bug-report", {
        body: {
          title: title.trim(),
          description: description.trim(),
          priority,
          page: location.pathname,
          reportedBy: user?.email || "Unbekannt",
        },
      });

      if (error) throw error;

      toast.success("Fehlermeldung wurde gesendet!");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setOpen(false);
    } catch (err) {
      console.error("Bug report error:", err);
      toast.error("Fehler beim Senden der Meldung");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-muted-foreground h-8"
        >
          <Bug className="mr-2 h-3.5 w-3.5" />
          Fehler melden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bug className="h-4 w-4" />
            Fehler melden
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title" className="text-sm">Titel</Label>
            <Input
              id="bug-title"
              placeholder="Kurze Beschreibung des Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bug-desc" className="text-sm">Beschreibung</Label>
            <Textarea
              id="bug-desc"
              placeholder="Was ist passiert? Was hast du erwartet?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Priorität</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Niedrig</SelectItem>
                <SelectItem value="medium">🟡 Mittel</SelectItem>
                <SelectItem value="high">🔴 Hoch</SelectItem>
                <SelectItem value="critical">🚨 Kritisch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Seite: {location.pathname}
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Fehlermeldung senden"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
