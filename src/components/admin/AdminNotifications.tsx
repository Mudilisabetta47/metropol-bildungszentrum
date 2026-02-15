import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Users, Receipt, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  type: "warning" | "info" | "alert";
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const [pendingRegs, unreadContacts, overdueInvoices] = await Promise.all([
        supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("is_deleted", false),
        supabase
          .from("contact_requests")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "overdue")
          .eq("is_deleted", false),
      ]);

      const items: NotificationItem[] = [];

      if (pendingRegs.count && pendingRegs.count > 0) {
        items.push({
          id: "pending-regs",
          title: `${pendingRegs.count} offene Anmeldungen`,
          description: "Warten auf Bestätigung",
          icon: Users,
          href: "/admin/registrations",
          type: "info",
        });
      }

      if (unreadContacts.count && unreadContacts.count > 0) {
        items.push({
          id: "unread-contacts",
          title: `${unreadContacts.count} ungelesene Nachrichten`,
          description: "Neue Kontaktanfragen",
          icon: MessageSquare,
          href: "/admin/contacts",
          type: "info",
        });
      }

      if (overdueInvoices.count && overdueInvoices.count > 0) {
        items.push({
          id: "overdue-invoices",
          title: `${overdueInvoices.count} überfällige Rechnungen`,
          description: "Zahlungserinnerung nötig",
          icon: AlertTriangle,
          href: "/admin/invoices",
          type: "warning",
        });
      }

      setNotifications(items);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold">Benachrichtigungen</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Laden...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Keine neuen Benachrichtigungen
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-1.5",
                    item.type === "warning"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
