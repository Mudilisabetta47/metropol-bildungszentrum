import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import Index from "./pages/Index";
import LicenseClassPage from "./pages/LicenseClassPage";
import LocationPage from "./pages/LocationPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Courses from "./pages/admin/Courses";
import Schedule from "./pages/admin/Schedule";
import Registrations from "./pages/admin/Registrations";
import Contacts from "./pages/admin/Contacts";
import Statistics from "./pages/admin/Statistics";
import Locations from "./pages/admin/Locations";
import Settings from "./pages/admin/Settings";
import Team from "./pages/admin/Team";
import Participants from "./pages/admin/Participants";
import Payments from "./pages/admin/Payments";
import Invoices from "./pages/admin/Invoices";
import Certificates from "./pages/admin/Certificates";
import InvitePage from "./pages/InvitePage";
// Portal imports
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalCourses from "./pages/portal/PortalCourses";
import PortalCertificates from "./pages/portal/PortalCertificates";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalProfile from "./pages/portal/PortalProfile";
import AcceptInvitation from "./pages/portal/AcceptInvitation";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CookieConsentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/ueber-uns" element={<AboutPage />} />
              <Route path="/kontakt" element={<ContactPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              <Route path="/fuehrerschein/:classType" element={<LicenseClassPage />} />
              <Route path="/standort/:locationSlug" element={<LocationPage />} />
              
              {/* Admin routes */}
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
              
              {/* Invite route */}
              <Route path="/invite/:token" element={<InvitePage />} />
              
              {/* Portal routes */}
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route path="/portal" element={<PortalDashboard />} />
              <Route path="/portal/kurse" element={<PortalCourses />} />
              <Route path="/portal/zertifikate" element={<PortalCertificates />} />
              <Route path="/portal/rechnungen" element={<PortalInvoices />} />
              <Route path="/portal/profil" element={<PortalProfile />} />
              <Route path="/portal/einladung/:token" element={<AcceptInvitation />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieBanner />
            <CookieSettingsButton />
          </BrowserRouter>
        </TooltipProvider>
      </CookieConsentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;