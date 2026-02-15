import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Receipt,
  Calendar,
  Download,
} from "lucide-react";

const actions = [
  { label: "Teilnehmer anlegen", icon: UserPlus, href: "/admin/participants" },
  { label: "Rechnung erstellen", icon: Receipt, href: "/admin/invoices" },
  { label: "Kurstermin planen", icon: Calendar, href: "/admin/schedule" },
  { label: "Export erstellen", icon: Download, href: "/admin/statistics" },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.label} to={action.href}>
          <Card className="border hover:border-primary/30 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-3">
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{action.label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
