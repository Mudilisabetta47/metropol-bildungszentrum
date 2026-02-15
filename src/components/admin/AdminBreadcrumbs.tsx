import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LayoutDashboard } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  participants: "Teilnehmer",
  courses: "Kurse",
  schedule: "Termine",
  registrations: "Anmeldungen",
  invoices: "Rechnungen",
  certificates: "Zertifikate",
  payments: "Zahlungen",
  contacts: "Kontaktanfragen",
  statistics: "Statistiken",
  locations: "Standorte",
  team: "Team",
  settings: "Einstellungen",
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the dashboard itself
  if (segments.length <= 1 || (segments.length === 1 && segments[0] === "admin")) {
    return null;
  }

  // Build breadcrumb items from segments (skip "admin" as it becomes Dashboard)
  const crumbs = segments.slice(1).map((seg, idx) => ({
    label: routeLabels[seg] || seg,
    href: "/" + segments.slice(0, idx + 2).join("/"),
    isLast: idx === segments.length - 2,
  }));

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin" className="flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
