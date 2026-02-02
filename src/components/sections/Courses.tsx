import { useState } from "react";
import { ArrowRight, Clock, MapPin, Users, Calendar, Truck, Bus, GraduationCap, BookOpen, Languages, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "Alle Kurse" },
  { id: "lkw", name: "LKW-Führerschein" },
  { id: "bus", name: "Bus-Führerschein" },
  { id: "fahrlehrer", name: "Fahrlehrer" },
  { id: "weiterbildung", name: "Weiterbildung" },
];

const courses = [
  {
    id: 1,
    title: "Berufskraftfahrer C/CE",
    category: "lkw",
    description: "Komplette Ausbildung für den LKW-Führerschein mit praktischer und theoretischer Schulung.",
    duration: "8-10 Wochen",
    locations: ["Hannover", "Bremen", "Garbsen"],
    nextStart: "03.03.2026",
    spots: 12,
    icon: Truck,
    featured: true,
    price: "ab 3.500 €",
  },
  {
    id: 2,
    title: "Busführerschein D/DE",
    category: "bus",
    description: "Werden Sie Busfahrer*in und befördern Sie Menschen sicher an ihr Ziel.",
    duration: "6-8 Wochen",
    locations: ["Hannover", "Bremen"],
    nextStart: "17.03.2026",
    spots: 8,
    icon: Bus,
    featured: true,
    price: "ab 4.200 €",
  },
  {
    id: 3,
    title: "Fahrlehrer*innen-Ausbildung",
    category: "fahrlehrer",
    description: "Umfassende Ausbildung zum staatlich anerkannten Fahrlehrer.",
    duration: "12 Monate",
    locations: ["Hannover"],
    nextStart: "01.04.2026",
    spots: 15,
    icon: GraduationCap,
    featured: false,
    price: "ab 12.000 €",
  },
  {
    id: 4,
    title: "BKF-Weiterbildung Modul 1",
    category: "weiterbildung",
    description: "Eco-Training und Fahrsicherheit für Berufskraftfahrer.",
    duration: "1 Tag",
    locations: ["Hannover", "Bremen", "Garbsen"],
    nextStart: "10.02.2026",
    spots: 20,
    icon: BookOpen,
    featured: false,
    price: "120 €",
  },
  {
    id: 5,
    title: "BKF-Weiterbildung Modul 2",
    category: "weiterbildung",
    description: "Sozialvorschriften für den Güterverkehr.",
    duration: "1 Tag",
    locations: ["Hannover", "Bremen", "Garbsen"],
    nextStart: "11.02.2026",
    spots: 20,
    icon: BookOpen,
    featured: false,
    price: "120 €",
  },
  {
    id: 6,
    title: "Sprachkurs für Berufskraftfahrer",
    category: "weiterbildung",
    description: "Deutsch für den Berufsalltag als Kraftfahrer.",
    duration: "4 Wochen",
    locations: ["Hannover", "Bremen"],
    nextStart: "24.02.2026",
    spots: 15,
    icon: Languages,
    featured: false,
    price: "ab 800 €",
  },
];

export function Courses() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses = activeCategory === "all" 
    ? courses 
    : courses.filter(course => course.category === activeCategory);

  return (
    <section id="kurse" className="py-24 bg-secondary">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Unser Angebot</p>
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
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className={cn(
                "card-elevated p-6 flex flex-col",
                course.featured && "ring-2 ring-accent"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {course.featured && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4 self-start">
                  <Award className="h-3.5 w-3.5" />
                  Beliebt
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/5">
                  <course.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    {course.title}
                  </h3>
                  <p className="text-accent font-semibold">{course.price}</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-6 flex-1">
                {course.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{course.nextStart}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{course.locations.length} Standort{course.locations.length > 1 ? "e" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.spots} Plätze frei</span>
                </div>
              </div>

              <Button variant="default" className="w-full group">
                Mehr erfahren
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Nicht den passenden Kurs gefunden?</p>
          <Button variant="outline" size="lg">
            Alle Kurse ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}