import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Phone, CheckCircle, Clock, MapPin, Euro, Award,
  Users, GraduationCap, BookOpen, Car, Calendar, Shield, Star,
  FileText, HelpCircle, Loader2
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";
import { useCourse } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { generateBreadcrumbData, SITE_URL } from "@/components/seo/StructuredData";
import fahrlehrerHero from "@/assets/fahrlehrer-hero.jpg";
import fahrlehrerSlide from "@/assets/fahrlehrer-slide.png";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import agenturLogo from "@/assets/agentur-fuer-arbeit-logo.png";

// ─── SEO Meta Component ────────────────────────────────────
function FahrlehrerMeta() {
  useEffect(() => {
    document.title = "Fahrlehrer-Ausbildung | Fahrlehrerschein machen | METROPOL Bildungszentrum";
    const metaTags: Record<string, string> = {
      description: "Fahrlehrer werden in Hannover, Garbsen & Bremen ✓ Staatlich anerkannte Ausbildung ✓ Aufstiegs-BAföG möglich ✓ Moderne Schulungsfahrzeuge ✓ Jetzt informieren!",
      keywords: "Fahrlehrer Ausbildung, Fahrlehrerschein, Fahrlehrer werden, Fahrlehrerausbildung Hannover, Fahrlehrerausbildung Bremen, Fahrlehrerausbildung Niedersachsen, Fahrlehrer Klasse BE, Fahrlehrer Klasse CE, Aufstiegs-BAföG Fahrlehrer",
      "og:title": "Fahrlehrer-Ausbildung | METROPOL Bildungszentrum",
      "og:description": "Werden Sie Fahrlehrer! Staatlich anerkannte Ausbildung in Hannover, Garbsen & Bremen. 100% Förderung möglich.",
      "og:type": "website",
      "og:url": `${SITE_URL}/fahrlehrer-ausbildung`,
      "og:image": `${SITE_URL}/favicon.webp`,
    };

    const existingTags: HTMLMetaElement[] = [];
    Object.entries(metaTags).forEach(([name, content]) => {
      const attr = name.startsWith("og:") ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
        existingTags.push(tag);
      }
      tag.content = content;
    });

    // Breadcrumb structured data
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.setAttribute("data-structured-data", "fahrlehrer-breadcrumb");
    breadcrumbScript.textContent = JSON.stringify(
      generateBreadcrumbData([
        { name: "Startseite", url: SITE_URL },
        { name: "Fahrlehrer-Ausbildung", url: `${SITE_URL}/fahrlehrer-ausbildung` },
      ])
    );
    document.head.appendChild(breadcrumbScript);

    // FAQ structured data
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-structured-data", "fahrlehrer-faq");
    faqScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
    document.head.appendChild(faqScript);

    // Course structured data
    const courseScript = document.createElement("script");
    courseScript.type = "application/ld+json";
    courseScript.setAttribute("data-structured-data", "fahrlehrer-course");
    courseScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Fahrlehrer-Ausbildung (Klasse BE / CE / DE)",
      description: "Staatlich anerkannte Fahrlehrerausbildung mit theoretischer und praktischer Ausbildung. Werden Sie Fahrlehrer in Niedersachsen und Bremen.",
      provider: {
        "@type": "Organization",
        name: "METROPOL Bildungszentrum GmbH",
        url: SITE_URL,
      },
      educationalCredentialAwarded: "Fahrlehrerschein",
      occupationalCategory: "Fahrlehrer",
      courseMode: "onsite",
      availableLanguage: ["German"],
      url: `${SITE_URL}/fahrlehrer-ausbildung`,
      offers: {
        "@type": "Offer",
        category: "Aufstiegs-BAföG förderfähig",
        url: `${SITE_URL}/fahrlehrer-ausbildung`,
      },
    });
    document.head.appendChild(courseScript);

    return () => {
      existingTags.forEach(t => t.parentNode?.removeChild(t));
      [breadcrumbScript, faqScript, courseScript].forEach(s => s.parentNode?.removeChild(s));
    };
  }, []);
  return null;
}

// ─── FAQ Data ───────────────────────────────────────────────
const faqItems = [
  {
    q: "Welche Voraussetzungen brauche ich für die Fahrlehrer-Ausbildung?",
    a: "Sie benötigen mindestens einen Hauptschulabschluss, die Fahrerlaubnis Klasse B (seit mindestens 3 Jahren), ein Mindestalter von 21 Jahren, sowie ein polizeiliches Führungszeugnis und ein ärztliches Gutachten."
  },
  {
    q: "Wie lange dauert die Fahrlehrerausbildung?",
    a: "Die Grundausbildung zum Fahrlehrer Klasse BE dauert ca. 12 Monate. Bei Erweiterungen (CE, DE) kommen zusätzliche Ausbildungszeiten hinzu."
  },
  {
    q: "Kann die Fahrlehrer-Ausbildung gefördert werden?",
    a: "Ja! Die Ausbildung ist über Aufstiegs-BAföG (ehemals Meister-BAföG) förderfähig. Auch Bildungsgutscheine der Agentur für Arbeit oder des Jobcenters können unter bestimmten Voraussetzungen genutzt werden."
  },
  {
    q: "Was kostet die Fahrlehrer-Ausbildung?",
    a: "Die Kosten variieren je nach Ausbildungsklasse. Kontaktieren Sie uns für ein individuelles Angebot. Dank Aufstiegs-BAföG kann ein Großteil der Kosten gefördert werden."
  },
  {
    q: "An welchen Standorten bieten Sie die Fahrlehrer-Ausbildung an?",
    a: "Wir bieten die Fahrlehrerausbildung an unseren Standorten in Hannover, Garbsen und Bremen an."
  },
  {
    q: "Welche Fahrlehrerklassen kann ich bei Ihnen erwerben?",
    a: "Bei uns können Sie den Fahrlehrerschein der Klasse BE (Grundklasse), CE (LKW) und DE (Bus) erwerben."
  },
  {
    q: "Was verdient ein Fahrlehrer?",
    a: "Das Einstiegsgehalt für Fahrlehrer liegt in Deutschland bei ca. 2.800–3.500 € brutto. Mit Erfahrung und Zusatzqualifikationen (CE, DE) sind 3.500–5.000 € und mehr möglich. Die Nachfrage nach Fahrlehrern ist aktuell sehr hoch."
  },
];

// ─── Ausbildungsinhalte ─────────────────────────────────────
const ausbildungsinhalte = [
  {
    icon: BookOpen,
    title: "Pädagogische Ausbildung",
    items: ["Verkehrspädagogik", "Unterrichtsplanung & -gestaltung", "Lernpsychologie", "Prüfungsvorbereitung Ihrer Fahrschüler"],
  },
  {
    icon: Car,
    title: "Fachliche Ausbildung",
    items: ["Straßenverkehrsrecht", "Fahrzeugtechnik", "Umweltschutz im Verkehr", "Fahrphysik & Fahrdynamik"],
  },
  {
    icon: GraduationCap,
    title: "Praktische Ausbildung",
    items: ["Lehrproben (Theorie & Praxis)", "Hospitationen in der Fahrschule", "Praktische Fahrstunden geben", "Prüfungsbegleitung"],
  },
];

// ─── USPs ───────────────────────────────────────────────────
const usps = [
  { icon: Shield, title: "Staatlich anerkannt", desc: "TQCert-zertifizierte Ausbildungsstätte nach AZAV" },
  { icon: Users, title: "Kleine Gruppen", desc: "Individuelle Betreuung in überschaubaren Klassen" },
  { icon: Car, title: "Moderne Fahrzeuge", desc: "Ausbildung auf aktuellen Schulungsfahrzeugen" },
  { icon: Award, title: "Hohe Bestehensquote", desc: "Überdurchschnittliche Erfolgsquote bei Prüfungen" },
  { icon: Euro, title: "Förderung möglich", desc: "Aufstiegs-BAföG, Bildungsgutschein & mehr" },
  { icon: MapPin, title: "3 Standorte", desc: "Hannover, Garbsen und Bremen" },
];

// ─── Course Dates Hook ──────────────────────────────────────
function useFahrlehrerDates(courseId: string | undefined) {
  return useQuery({
    queryKey: ["fahrlehrer-dates", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("course_dates")
        .select("id, start_date, end_date, max_participants, current_participants, locations (name)")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════════
export default function FahrlehrerPage() {
  const { data: settings } = useSiteSettings();
  const { data: course } = useCourse("fahrlehrer");
  const { data: courseDates = [] } = useFahrlehrerDates(course?.id);

  return (
    <div className="min-h-screen">
      <FahrlehrerMeta />
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-32 overflow-hidden">
        <div className="relative w-full min-h-[500px] sm:min-h-[600px]">
          <img
            src={fahrlehrerHero}
            alt="Fahrlehrer-Ausbildung bei METROPOL Bildungszentrum"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="relative z-10 section-container py-16 sm:py-24 flex flex-col justify-center min-h-[500px] sm:min-h-[600px]">
            <div className="max-w-2xl">
              <span className="inline-block bg-accent text-accent-foreground text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                Jetzt Fahrlehrer werden
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Fahrlehrer-Ausbildung
                <span className="block text-accent">in Niedersachsen & Bremen</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
                Starten Sie Ihre Karriere als staatlich anerkannter Fahrlehrer – mit 
                Aufstiegs-BAföG förderfähig. Klassen BE, CE & DE.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-base" asChild>
                  <a href="#kontakt">
                    Kostenlos beraten lassen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="heroOutline" className="text-base border-white text-white hover:bg-white/10" asChild>
                  <a href={formatPhoneLink(settings?.central_phone || "")}>
                    <Phone className="mr-2 h-5 w-5" />
                    {settings?.central_phone || "Jetzt anrufen"}
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-white/80 text-sm">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Aufstiegs-BAföG</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> 3 Standorte</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Hohe Bestehensquote</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-primary py-4">
        <div className="section-container flex flex-wrap items-center justify-center gap-8 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            4.8 Google Bewertung
          </div>
          <div className="hidden sm:block w-px h-6 bg-primary-foreground/30" />
          <div className="flex items-center gap-3">
            <img src={tqcertLogo} alt="TQCert zertifiziert" className="h-8 brightness-0 invert opacity-80" />
            <span className="text-sm">AZAV-zertifiziert</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-primary-foreground/30" />
          <div className="flex items-center gap-3">
            <img src={agenturLogo} alt="Agentur für Arbeit" className="h-8 brightness-0 invert opacity-80" />
            <span className="text-sm">Förderfähig</span>
          </div>
        </div>
      </section>

      {/* ── USPs ── */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Warum METROPOL?</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ihre Vorteile bei uns
            </h2>
            <p className="text-muted-foreground text-lg">
              Seit über 5 Jahren bilden wir erfolgreich Fahrlehrer aus – praxisnah, modern und mit persönlicher Betreuung.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {usps.map((usp, i) => (
              <AnimatedSection key={usp.title} delay={i * 100}>
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <usp.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground">{usp.title}</h3>
                  <p className="text-muted-foreground text-sm">{usp.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUSBILDUNGSINHALTE ── */}
      <section className="py-20 bg-secondary">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Ausbildung</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Was Sie in der Ausbildung erwartet
            </h2>
            <p className="text-muted-foreground text-lg">
              Unsere Fahrlehrerausbildung umfasst pädagogische, fachliche und praktische Module für eine umfassende Qualifikation.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {ausbildungsinhalte.map((modul, i) => (
              <AnimatedSection key={modul.title} delay={i * 150}>
                <div className="bg-card rounded-xl p-8 border border-border h-full">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <modul.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-4 text-foreground">{modul.title}</h3>
                  <ul className="space-y-3">
                    {modul.items.map(item => (
                      <li key={item} className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── KLASSEN ÜBERSICHT ── */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Fahrlehrerklassen</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Welche Klassen können Sie erwerben?
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                klasse: "Klasse BE",
                label: "Grundklasse",
                desc: "PKW-Fahrlehrer – die Basis für Ihre Karriere. Pflichtklasse für alle weiteren Erweiterungen.",
                highlight: true,
              },
              {
                klasse: "Klasse CE",
                label: "Erweiterung LKW",
                desc: "LKW-Fahrlehrer – erweitern Sie Ihr Spektrum und steigern Sie Ihr Einkommen deutlich.",
                highlight: false,
              },
              {
                klasse: "Klasse DE",
                label: "Erweiterung Bus",
                desc: "Bus-Fahrlehrer – ein gefragtes Spezialgebiet mit exzellenten Verdienstmöglichkeiten.",
                highlight: false,
              },
            ].map((k, i) => (
              <AnimatedSection key={k.klasse} delay={i * 150}>
                <div className={`rounded-xl p-8 border h-full transition-all ${
                  k.highlight 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]" 
                    : "bg-card text-foreground border-border hover:shadow-md"
                }`}>
                  {k.highlight && (
                    <span className="text-xs font-bold bg-primary-foreground/20 px-3 py-1 rounded-full mb-4 inline-block">
                      Empfohlen
                    </span>
                  )}
                  <h3 className="font-display font-bold text-2xl mb-1">{k.klasse}</h3>
                  <p className={`text-sm font-medium mb-4 ${k.highlight ? "text-primary-foreground/80" : "text-accent"}`}>
                    {k.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${k.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {k.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── VORAUSSETZUNGEN ── */}
      <section className="py-20 bg-secondary">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Voraussetzungen</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-8">
                Das bringen Sie mit
              </h2>
              <ul className="space-y-5">
                {[
                  "Mindestalter: 21 Jahre",
                  "Fahrerlaubnis Klasse B (seit mind. 3 Jahren)",
                  "Hauptschulabschluss oder gleichwertig",
                  "Polizeiliches Führungszeugnis",
                  "Ärztliches Gutachten (Sehtest & Gesundheit)",
                  "Gute Deutschkenntnisse (mind. B2)",
                  "Keine Eintragungen im Fahreignungsregister (max. 1 Punkt)",
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-foreground font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={fahrlehrerSlide}
                  alt="Fahrlehrer bei der Ausbildung im METROPOL Bildungszentrum"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FÖRDERUNG ── */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="max-w-4xl mx-auto">
            <div className="bg-primary rounded-2xl p-8 sm:p-12 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Euro className="h-8 w-8" />
                  <h2 className="font-display text-3xl sm:text-4xl font-bold">Förderung & Finanzierung</h2>
                </div>
                <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl">
                  Die Fahrlehrer-Ausbildung ist förderfähig – Sie müssen die Kosten nicht alleine tragen!
                </p>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  {[
                    { title: "Aufstiegs-BAföG", desc: "Bis zu 75% Zuschuss + zinsgünstiges Darlehen für den Rest. Altersunabhängig!" },
                    { title: "Bildungsgutschein", desc: "Bei Arbeitslosigkeit oder drohender Arbeitslosigkeit bis zu 100% Förderung durch die Agentur für Arbeit." },
                    { title: "Ratenzahlung", desc: "Flexible Ratenzahlungsmodelle nach individueller Vereinbarung möglich." },
                    { title: "Steuerlich absetzbar", desc: "Ausbildungskosten können als Werbungskosten in der Steuererklärung geltend gemacht werden." },
                  ].map(f => (
                    <div key={f.title} className="bg-primary-foreground/10 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                      <p className="text-primary-foreground/80 text-sm">{f.desc}</p>
                    </div>
                  ))}
                </div>
                <Button size="lg" variant="heroWhite" asChild>
                  <a href="#kontakt">
                    Kostenlose Förderberatung
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── NÄCHSTE TERMINE ── */}
      {courseDates.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="section-container">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Termine</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Nächste Starttermine
              </h2>
              <p className="text-muted-foreground text-lg">Sichern Sie sich Ihren Platz – die Gruppen sind bewusst klein gehalten.</p>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {courseDates.map((cd: any) => {
                const spotsLeft = cd.max_participants - cd.current_participants;
                const isAlmostFull = spotsLeft <= 3;
                return (
                  <AnimatedSection key={cd.id}>
                    <div className={`bg-card rounded-xl p-6 border transition-all ${isAlmostFull ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-4">
                        <Calendar className="h-6 w-6 text-accent" />
                        {isAlmostFull && (
                          <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                            Fast ausgebucht!
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-foreground">
                        {format(new Date(cd.start_date), "dd. MMMM yyyy", { locale: de })}
                      </h3>
                      {cd.end_date && cd.end_date !== cd.start_date && (
                        <p className="text-sm text-muted-foreground mb-2">
                          bis {format(new Date(cd.end_date), "dd. MMMM yyyy", { locale: de })}
                        </p>
                      )}
                      {cd.locations?.name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                          <MapPin className="h-4 w-4" /> {cd.locations.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isAlmostFull ? "text-destructive" : "text-muted-foreground"}`}>
                          {spotsLeft > 0 ? `Noch ${spotsLeft} Plätze` : "Ausgebucht"}
                        </span>
                        <Button size="sm" disabled={spotsLeft === 0} asChild>
                          <a href="#kontakt">Anfragen</a>
                        </Button>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STANDORTE ── */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Standorte</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Fahrlehrerausbildung in Ihrer Nähe
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Hannover", address: "Vahrenwalder Str. 213", zip: "30165 Hannover", slug: "hannover" },
              { name: "Garbsen", address: "Planetenring 25", zip: "30823 Garbsen", slug: "garbsen" },
              { name: "Bremen", address: "Bahnhofsplatz 41", zip: "28195 Bremen", slug: "bremen" },
            ].map((loc, i) => (
              <AnimatedSection key={loc.slug} delay={i * 150}>
                <Link
                  to={`/standort/${loc.slug}`}
                  className="block bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <MapPin className="h-8 w-8 text-accent mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">{loc.name}</h3>
                  <p className="text-muted-foreground text-sm">{loc.address}</p>
                  <p className="text-muted-foreground text-sm mb-4">{loc.zip}</p>
                  <span className="text-accent font-medium text-sm inline-flex items-center gap-1">
                    Standort ansehen <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-secondary">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Häufige Fragen</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              FAQ zur Fahrlehrer-Ausbildung
            </h2>
          </AnimatedSection>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <details className="group bg-card border border-border rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-display font-semibold text-foreground hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      {faq.q}
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 rotate-90 group-open:rotate-[270deg] transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-6 pl-14 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 bg-primary">
        <div className="section-container text-center text-primary-foreground">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Bereit für Ihre Karriere als Fahrlehrer?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Lassen Sie sich jetzt kostenlos und unverbindlich beraten. Wir helfen Ihnen bei der Förderung und finden den passenden Starttermin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="heroWhite" asChild>
              <a href="#kontakt">
                Jetzt Beratung anfordern
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="heroOutline" asChild>
              <a href={formatPhoneLink(settings?.central_phone || "")}>
                <Phone className="mr-2 h-5 w-5" />
                {settings?.central_phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <Contact preselectedCourse="fahrlehrer" />

      <Footer />
    </div>
  );
}
