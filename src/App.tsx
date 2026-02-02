import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import LicenseClassPage from "./pages/LicenseClassPage";
import LocationPage from "./pages/LocationPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/fuehrerschein/:classType" element={<LicenseClassPage />} />
            <Route path="/standort/:locationSlug" element={<LocationPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="locations" element={<Locations />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;