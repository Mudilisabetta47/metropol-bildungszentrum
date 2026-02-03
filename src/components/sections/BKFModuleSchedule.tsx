import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModuleDate {
  date: string;
  formatted: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  dates: ModuleDate[];
}

const modules: Module[] = [
  {
    id: 1,
    title: "Modul 1 – Eco-Training & Assistenzsysteme",
    description: "Wirtschaftliches Fahren, moderne Fahrerassistenzsysteme und umweltbewusstes Verhalten",
    dates: [
      { date: "2026-04-25", formatted: "25.04.2026" },
      { date: "2026-08-22", formatted: "22.08.2026" },
      { date: "2026-11-07", formatted: "07.11.2026" },
    ],
  },
  {
    id: 2,
    title: "Modul 2 – Sozialvorschriften & Fahrtenschreiber",
    description: "Lenk- und Ruhezeiten, digitaler Tachograph und rechtliche Grundlagen",
    dates: [
      { date: "2026-02-07", formatted: "07.02.2026" },
      { date: "2026-02-21", formatted: "21.02.2026" },
      { date: "2026-05-09", formatted: "09.05.2026" },
      { date: "2026-09-12", formatted: "12.09.2026" },
      { date: "2026-11-21", formatted: "21.11.2026" },
    ],
  },
  {
    id: 3,
    title: "Modul 3 – Sicherheit & Technik",
    description: "Fahrzeugtechnik, Sicherheitseinrichtungen und Gefahrenvermeidung",
    dates: [
      { date: "2026-05-27", formatted: "27.05.2026" },
      { date: "2026-09-26", formatted: "26.09.2026" },
      { date: "2026-12-12", formatted: "12.12.2026" },
    ],
  },
  {
    id: 4,
    title: "Modul 4 – Schadensprävention & Gesundheit",
    description: "Ergonomie, Gesundheitsschutz und Unfallverhütung am Arbeitsplatz",
    dates: [
      { date: "2026-03-28", formatted: "28.03.2026" },
      { date: "2026-06-13", formatted: "13.06.2026" },
      { date: "2026-10-10", formatted: "10.10.2026" },
    ],
  },
  {
    id: 5,
    title: "Modul 5 – Image & Dienstleistung",
    description: "Kundenorientierung, Kommunikation und professionelles Auftreten",
    dates: [
      { date: "2026-03-07", formatted: "07.03.2026" },
      { date: "2026-04-11", formatted: "11.04.2026" },
      { date: "2026-08-08", formatted: "08.08.2026" },
      { date: "2026-10-24", formatted: "24.10.2026" },
    ],
  },
];

// Kompaktwochen: Mo-Fr aufeinander folgende Module
const compactWeeks = [
  {
    id: 1,
    title: "Kompaktwoche Februar",
    dateRange: "09.02. – 13.02.2026",
    modules: "Module 1–5",
  },
  {
    id: 2,
    title: "Kompaktwoche Mai",
    dateRange: "11.05. – 15.05.2026",
    modules: "Module 1–5",
  },
  {
    id: 3,
    title: "Kompaktwoche September",
    dateRange: "14.09. – 18.09.2026",
    modules: "Module 1–5",
  },
  {
    id: 4,
    title: "Kompaktwoche November",
    dateRange: "23.11. – 27.11.2026",
    modules: "Module 1–5",
  },
];

interface BKFModuleScheduleProps {
  onSelectModule?: (moduleName: string, date: string) => void;
}

export function BKFModuleSchedule({ onSelectModule }: BKFModuleScheduleProps) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const toggleModule = (moduleId: number) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleDateClick = (moduleNumber: number, moduleTitle: string, formattedDate: string) => {
    if (onSelectModule) {
      // Übergebe kurze Beschreibung: "Modul 1 – 25.04.2026"
      const shortTitle = `Modul ${moduleNumber}`;
      onSelectModule(shortTitle, formattedDate);
    }
    // Scroll to contact form
    const contactSection = document.getElementById("kontakt");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCompactWeekClick = (weekTitle: string, dateRange: string) => {
    if (onSelectModule) {
      onSelectModule("Kompaktwoche (Module 1-5)", dateRange);
    }
    // Scroll to contact form
    const contactSection = document.getElementById("kontakt");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Termine 2026
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            BKF-Weiterbildung Module 1-5
          </h2>
          <p className="text-lg text-muted-foreground">
            Wählen Sie einzelne Module oder buchen Sie eine komplette Kompaktwoche. 
            Klicken Sie auf einen Termin, um sich anzumelden.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map((module) => (
              <div
                key={module.id}
                className={cn(
                  "bg-card border border-border rounded-xl overflow-hidden transition-all",
                  expandedModule === module.id && "ring-2 ring-primary shadow-lg"
                )}
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {module.id}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      <Calendar className="h-4 w-4" />
                      {module.dates.length} Termine
                    </span>
                    {expandedModule === module.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Dates */}
                {expandedModule === module.id && (
                  <div className="border-t border-border bg-muted/30 p-5">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {module.dates.map((dateItem) => (
                        <button
                          key={dateItem.date}
                          onClick={() => handleDateClick(module.id, module.title, dateItem.formatted)}
                          className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <span className="font-semibold text-foreground block">
                                {dateItem.formatted}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                7 Unterrichtseinheiten
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>08:00 – 16:00 Uhr</span>
                      </div>
                      <span className="text-primary font-semibold">120 € / Modul</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compact Weeks Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-primary rounded-xl p-6 text-primary-foreground sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6" />
                <h3 className="font-display font-bold text-lg">Kompaktwochen</h3>
              </div>
              <p className="text-primary-foreground/80 text-sm mb-6">
                Alle 5 Module in einer Woche (Mo–Fr). Ideal für schnelle Verlängerung der Schlüsselzahl 95.
              </p>
              
              <div className="space-y-3">
                {compactWeeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => handleCompactWeekClick(week.title, week.dateRange)}
                    className="w-full bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg p-4 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold block">{week.title}</span>
                        <span className="text-primary-foreground/80 text-sm">
                          {week.dateRange}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-foreground/80">Komplettpreis:</span>
                  <span className="font-bold text-xl">550 €</span>
                </div>
                <p className="text-primary-foreground/70 text-xs mt-2">
                  10% Rabatt bei Buchung aller 5 Module
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-muted/50 border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-1">
              <h4 className="font-display font-bold text-foreground mb-2">
                Wichtig: Schlüsselzahl 95 Verlängerung
              </h4>
              <p className="text-muted-foreground text-sm">
                Die 35-stündige Weiterbildung muss alle 5 Jahre absolviert werden. 
                Nach erfolgreicher Teilnahme erhalten Sie eine Bescheinigung zur Verlängerung 
                der Schlüsselzahl 95 bei Ihrer Führerscheinstelle.
              </p>
            </div>
            <Button variant="default" asChild>
              <a href="#kontakt">
                Jetzt Termin sichern
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
