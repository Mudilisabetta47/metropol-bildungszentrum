import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Truck, Bus, GraduationCap, BookOpen, Award, Flame, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCourses } from "@/hooks/useCourses";


const categories = [
  { id: "all", name: "Alle Kurse" },
  { id: "lkw", name: "LKW-Führerschein" },
  { id: "bus", name: "Bus-Führerschein" },
  { id: "fahrlehrer", name: "Fahrlehrer" },
  { id: "bkf", name: "Weiterbildung" },
  { id: "sonstige", name: "Qualifizierungen" },
];

// Map category to icon
const categoryIcons: Record<string, typeof Truck> = {
  lkw: Truck,
  bus: Bus,
  fahrlehrer: GraduationCap,
  bkf: BookOpen,
  sonstige: Truck,
  sprache: BookOpen,
};

// Featured courses (slugs)
const featuredSlugs = ["c-ce", "d-de"];

interface CourseCapacityData {
  maxSpots: number;
  spotsLeft: number;
}

// Marketing capacity data - fixed values for landing page display
// These are intentionally simulated for marketing purposes to create urgency
const marketingCapacity: Record<string, CourseCapacityData> = {
  "c-ce": { maxSpots: 20, spotsLeft: 4 },
  "d-de": { maxSpots: 18, spotsLeft: 3 },
  "c1-c1e": { maxSpots: 15, spotsLeft: 6 },
  "bkf-weiterbildung": { maxSpots: 25, spotsLeft: 8 },
  "fahrlehrer": { maxSpots: 12, spotsLeft: 2 },
  "auslieferungsfahrer": { maxSpots: 16, spotsLeft: 5 },
  "citylogistiker": { maxSpots: 14, spotsLeft: 7 },
};

function getUrgencyLevel(spotsLeft: number, maxSpots: number) {
  const percentage = (spotsLeft / maxSpots) * 100;
  if (spotsLeft <= 2) return "critical";
  if (spotsLeft <= 4) return "warning";
  if (percentage <= 40) return "moderate";
  return "normal";
}

export function CoursesFromDB() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: courses, isLoading, error } = useCourses();

  // Use marketing capacity data for landing page display
  const getCapacity = (slug: string): CourseCapacityData => {
    return marketingCapacity[slug] || { maxSpots: 20, spotsLeft: 9 };
  };

  const filteredCourses = courses?.filter(course => 
    activeCategory === "all" || course.category === activeCategory
  ) || [];

  if (isLoading) {
    return (
      <section id="kurse" className="py-24 bg-secondary">
        <div className="section-container">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Kurse werden geladen...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="kurse" className="py-24 bg-secondary">
        <div className="section-container">
          <div className="text-center py-20">
            <p className="text-destructive">Fehler beim Laden der Kurse</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="kurse" className="py-24 bg-secondary">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Unser Angebot</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Professionelle Aus- und Weiterbildung
          </h2>
          <p className="text-lg text-muted-foreground">
            Wählen Sie aus unserem umfangreichen Kursangebot und starten Sie Ihre Karriere im Transportwesen.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const Icon = categoryIcons[course.category] || Truck;
            const isFeatured = featuredSlugs.includes(course.slug);
            const capacity = getCapacity(course.slug);
            const urgency = getUrgencyLevel(capacity.spotsLeft, capacity.maxSpots);
            const isUrgent = urgency === "critical" || urgency === "warning";
            
            return (
              <div
                key={course.id}
                className={cn(
                  "card-elevated p-6 flex flex-col relative overflow-hidden",
                  isFeatured && "ring-2 ring-primary",
                  isUrgent && "ring-2 ring-destructive/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Urgency Badge */}
                {isUrgent && (
                  <div className="absolute -top-1 -right-12 rotate-45 bg-destructive text-destructive-foreground text-xs font-bold px-12 py-1">
                    Fast ausgebucht!
                  </div>
                )}

                {isFeatured && !isUrgent && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 self-start">
                    <Award className="h-3.5 w-3.5" />
                    Beliebt
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">
                      {course.title}
                    </h3>
                    {course.price_info && (
                      <p className="text-primary font-semibold text-sm">{course.price_info}</p>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {course.duration_info && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_info}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>3 Standorte</span>
                  </div>
                </div>

                {/* Capacity indicator with urgency */}
                <div className={cn(
                  "mb-4 p-3 rounded-lg border",
                  urgency === "critical" && "bg-destructive/10 border-destructive/30",
                  urgency === "warning" && "bg-orange-500/10 border-orange-500/30",
                  urgency === "moderate" && "bg-yellow-500/10 border-yellow-500/30",
                  urgency === "normal" && "bg-muted/50 border-border"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isUrgent && <Flame className="h-4 w-4 text-destructive animate-pulse" />}
                      <Users className={cn(
                        "h-4 w-4",
                        isUrgent ? "text-destructive" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        urgency === "critical" && "text-destructive",
                        urgency === "warning" && "text-orange-600 dark:text-orange-400"
                      )}>
                        {capacity.spotsLeft <= 2 
                          ? `Nur noch ${capacity.spotsLeft} Plätze!` 
                          : `Noch ${capacity.spotsLeft} von ${capacity.maxSpots} Plätzen`}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        urgency === "critical" && "bg-destructive",
                        urgency === "warning" && "bg-orange-500",
                        urgency === "moderate" && "bg-yellow-500",
                        urgency === "normal" && "bg-primary"
                      )}
                      style={{ 
                        width: `${((capacity.maxSpots - capacity.spotsLeft) / capacity.maxSpots) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <Button 
                  variant={isUrgent ? "destructive" : "default"} 
                  className="w-full group" 
                  asChild
                >
                  <Link to={`/fuehrerschein/${course.slug}`}>
                    {isUrgent ? "Jetzt Platz sichern" : "Mehr erfahren"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Haben Sie Fragen zu unseren Kursen?</p>
          <Button variant="outline" size="lg" asChild>
            <a href="#kontakt">Jetzt Beratung anfragen</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
