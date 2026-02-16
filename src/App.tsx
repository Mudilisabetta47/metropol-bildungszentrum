import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";

// Eagerly loaded (critical path)
import Index from "./pages/Index";

// Lazy loaded pages
const LicenseClassPage = lazy(() => import("./pages/LicenseClassPage"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage"));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InvitePage = lazy(() => import("./pages/InvitePage"));

// Admin (heavy – always lazy)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Courses = lazy(() => import("./pages/admin/Courses"));
const Schedule = lazy(() => import("./pages/admin/Schedule"));
const Registrations = lazy(() => import("./pages/admin/Registrations"));
const Contacts = lazy(() => import("./pages/admin/Contacts"));
const Statistics = lazy(() => import("./pages/admin/Statistics"));
const Locations = lazy(() => import("./pages/admin/Locations"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Team = lazy(() => import("./pages/admin/Team"));
const Participants = lazy(() => import("./pages/admin/Participants"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const Invoices = lazy(() => import("./pages/admin/Invoices"));
const Certificates = lazy(() => import("./pages/admin/Certificates"));

// Portal (lazy)
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const PortalCourses = lazy(() => import("./pages/portal/PortalCourses"));
const PortalCertificates = lazy(() => import("./pages/portal/PortalCertificates"));
const PortalInvoices = lazy(() => import("./pages/portal/PortalInvoices"));
const PortalProfile = lazy(() => import("./pages/portal/PortalProfile"));
const AcceptInvitation = lazy(() => import("./pages/portal/AcceptInvitation"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CookieConsentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/ueber-uns" element={<AboutPage />} />
                <Route path="/kontakt" element={<ContactPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/fuehrerschein/:classType" element={<LicenseClassPage />} />
                <Route path="/standort/:locationSlug" element={<LocationPage />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="participants" element={<Participants />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="registrations" element={<Registrations />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="locations" element={<Locations />} />
                  <Route path="team" element={<Team />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="/invite/:token" element={<InvitePage />} />

                {/* Portal */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalDashboard />} />
                <Route path="/portal/kurse" element={<PortalCourses />} />
                <Route path="/portal/zertifikate" element={<PortalCertificates />} />
                <Route path="/portal/rechnungen" element={<PortalInvoices />} />
                <Route path="/portal/profil" element={<PortalProfile />} />
                <Route path="/portal/einladung/:token" element={<AcceptInvitation />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieBanner />
            <CookieSettingsButton />
          </BrowserRouter>
        </TooltipProvider>
      </CookieConsentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
