import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Clock, MapPin, Calendar, CheckCircle, Phone, Euro, Award, Users, FileText, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";
import { BKFModuleSchedule } from "@/components/sections/BKFModuleSchedule";
import { useCourse } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import trucksImage from "@/assets/trucks-metropol.jpg";
import busImage from "@/assets/bus-metropol.jpg";
import fleetTeam from "@/assets/fleet-team.webp";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";

// Map category to hero image
const categoryImages: Record<string, string> = {
  lkw: trucksImage,
  bus: busImage,
  fahrlehrer: fleetTeam,
  bkf: trucksImage,
  sprache: fleetTeam,
  sonstige: fleetTeam,
};

// Default funding text per category
const categoryFunding: Record<string, string> = {
  lkw: "100% Förderung durch Bildungsgutschein der Agentur für Arbeit oder des Jobcenters möglich.",
  bus: "100% Förderung durch Bildungsgutschein der Agentur für Arbeit oder des Jobcenters möglich.",
  fahrlehrer: "Förderung durch Aufstiegs-BAföG oder Bildungsgutschein möglich.",
  bkf: "Bei Arbeitslosigkeit oder drohender Arbeitslosigkeit kann die Weiterbildung gefördert werden.",
  sprache: "Förderung über Integrationskurse oder BAMF möglich.",
  sonstige: "Fragen Sie uns nach Fördermöglichkeiten.",
};

// Subtitles per category
const categorySubtitles: Record<string, string> = {
  lkw: "LKW-Führerschein für Berufskraftfahrer",
  bus: "Busführerschein für Personenbeförderung",
  fahrlehrer: "Werden Sie staatlich anerkannter Fahrlehrer",
  bkf: "Module 1-5 für Berufskraftfahrer",
  sprache: "Deutsch für den Berufsalltag",
  sonstige: "Qualifizierung für den Beruf",
};

interface CourseDate {
  id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  current_participants: number;
  locations: { name: string } | null;
}

// Hook to fetch course dates
function useCourseDates(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-dates", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("course_dates")
        .select(`
          id,
          start_date,
          end_date,
          start_time,
          end_time,
          max_participants,
          current_participants,
          locations (name)
        `)
        .eq("course_id", courseId)
        .eq("is_active", true)
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return (data || []) as CourseDate[];
    },
    enabled: !!courseId,
  });
}

// Hook to fetch all active locations
function useLocations() {
  return useQuery({
    queryKey: ["active-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("name")
        .eq("is_active", true);
      if (error) throw error;
      return data?.map(l => l.name) || [];
    },
  });
}

export default function LicenseClassPage() {
  const { classType } = useParams<{ classType: string }>();
  const { data: course, isLoading, error } = useCourse(classType || "");
  const { data: courseDates = [] } = useCourseDates(course?.id);
  const { data: allLocations = [] } = useLocations();
  const [selectedModuleInfo, setSelectedModuleInfo] = useState<string | null>(null);
  const { data: settings } = useSiteSettings();

  const handleModuleSelect = (moduleName: string, date: string) => {
    setSelectedModuleInfo(`${moduleName} – ${date}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Kurs wird geladen...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // Error or not found
  if (error || !course) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Kurs nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Der gesuchte Kurs existiert nicht oder ist nicht mehr verfügbar.
            </p>
            <Button asChild>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isBKFWeiterbildung = course.slug === "bkf-weiterbildung";
  const heroImage = categoryImages[course.category] || fleetTeam;
  const subtitle = categorySubtitles[course.category] || "Professionelle Ausbildung";
  const funding = categoryFunding[course.category] || "Fragen Sie uns nach Fördermöglichkeiten.";
  const benefits = course.benefits || [];
  const requirements = course.requirements ? course.requirements.split("\n").filter(Boolean) : [];

  // Format dates for display
  const nextDates = courseDates.slice(0, 3).map(cd => 
    format(new Date(cd.start_date), "dd.MM.yyyy", { locale: de })
  );

  // Get unique locations from course dates, fallback to all locations
  const courseLocations = courseDates.length > 0
    ? [...new Set(courseDates.map(cd => cd.locations?.name).filter(Boolean))]
    : allLocations;

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Image */}
      <section className="pt-28 sm:pt-32">
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden">
          <img 
            src={heroImage}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="section-container">
              <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm">
                ← Zurück zur Startseite
              </Link>
              <p className="text-white/80 font-medium mb-2">{subtitle}</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {course.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Key Info */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {course.description || `Informieren Sie sich über unseren Kurs "${course.title}" und starten Sie Ihre Karriere.`}
              </p>
              
              <div className="flex flex-wrap gap-6">
                {course.duration_info && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course.duration_info}</span>
                  </div>
                )}
                {course.price_info && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course.price_info}</span>
                  </div>
                )}
                {courseLocations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium">{courseLocations.slice(0, 3).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary text-primary-foreground rounded-xl p-6">
              <h3 className="font-display font-bold text-lg mb-4">Jetzt anmelden</h3>
              <div className="space-y-4 mb-6">
                <Button variant="heroWhite" size="lg" className="w-full" asChild>
                  <a href="#kontakt">
                    Unverbindlich anfragen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="heroOutline" size="lg" className="w-full" asChild>
                  <a href={formatPhoneLink(settings?.central_phone || "")}>
                    <Phone className="mr-2 h-4 w-4" />
                    {settings?.central_phone}
                  </a>
                </Button>
              </div>
              <p className="text-sm text-primary-foreground/80">{funding}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-12 bg-secondary">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Nächste Starttermine</h3>
              {nextDates.length > 0 ? (
                <ul className="space-y-2">
                  {nextDates.map((date) => (
                    <li key={date} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {date}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Termine auf Anfrage</p>
              )}
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Förderung</h3>
              <p className="text-muted-foreground text-sm">{funding}</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Standorte</h3>
              {courseLocations.length > 0 ? (
                <ul className="space-y-2">
                  {courseLocations.map((location) => (
                    <li key={location} className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {location}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Standorte auf Anfrage</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Curriculum - only show if data exists */}
      {(requirements.length > 0 || benefits.length > 0) && (
        <section className="py-20 bg-background">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Requirements */}
              {requirements.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">Voraussetzungen</h2>
                  </div>
                  <ul className="space-y-4">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits as Curriculum */}
              {benefits.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">Ihre Vorteile</h2>
                  </div>
                  <ul className="space-y-4">
                    {benefits.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Capacity & Dates Section */}
      {courseDates.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Verfügbare Termine</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Jetzt Platz sichern
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseDates.map((cd) => {
                const spotsLeft = cd.max_participants - cd.current_participants;
                const isAlmostFull = spotsLeft <= 3;
                
                return (
                  <div 
                    key={cd.id}
                    className={`bg-card rounded-xl p-6 border transition-all ${
                      isAlmostFull ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="h-6 w-6 text-primary" />
                      {isAlmostFull && (
                        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                          Fast ausgebucht!
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      {format(new Date(cd.start_date), "dd. MMMM yyyy", { locale: de })}
                    </h3>
                    {cd.end_date && cd.end_date !== cd.start_date && (
                      <p className="text-sm text-muted-foreground mb-2">
                        bis {format(new Date(cd.end_date), "dd. MMMM yyyy", { locale: de })}
                      </p>
                    )}
                    {cd.locations?.name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="h-4 w-4" />
                        {cd.locations.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isAlmostFull ? "text-destructive" : "text-muted-foreground"}`}>
                        {spotsLeft > 0 ? `Noch ${spotsLeft} Plätze` : "Ausgebucht"}
                      </span>
                      <Button size="sm" variant={spotsLeft > 0 ? "default" : "outline"} disabled={spotsLeft === 0} asChild>
                        <a href="#kontakt">Anfragen</a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* BKF Module Schedule - only for bkf-weiterbildung */}
      {isBKFWeiterbildung && (
        <BKFModuleSchedule onSelectModule={handleModuleSelect} />
      )}

      {/* Contact Section with preselected course and optional module info */}
      <Contact 
        preselectedCourse={course.slug} 
        additionalInfo={selectedModuleInfo || undefined}
      />
      
      <Footer />
    </div>
  );
}
