import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard, Phone, FileCheck, GraduationCap, CheckCircle2,
  Award, MapPin, ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { generateBreadcrumbData, SITE_URL } from "@/components/seo/StructuredData";
import { bildungsgutscheinFaqs } from "@/data/bildungsgutschein";

const PAGE_URL = `${SITE_URL}/bildungsgutschein`;

function BildungsgutscheinMeta() {
  useEffect(() => {
    document.title =
      "Bildungsgutschein einlösen | Weiterbildung 100 % gefördert | METROPOL";
    const metaTags: Record<string, string> = {
      description:
        "Bildungsgutschein einlösen in Hannover, Garbsen & Bremen ✓ AZAV-zertifiziert ✓ LKW-, Bus- & Berufskraftfahrer-Weiterbildung 100 % gefördert ✓ Bildungsgutschein beantragen – wir helfen.",
      keywords:
        "Bildungsgutschein, Bildungsgutschein Weiterbildung, Bildungsgutschein beantragen, Bildungsgutschein einlösen, Bildungsgutschein Agentur für Arbeit, Bildungsgutschein Jobcenter, Bildungsgutschein LKW Führerschein, Bildungsgutschein Hannover, Bildungsgutschein Bremen, Bildungsgutschein Garbsen, AZAV Bildungsträger, geförderte Weiterbildung",
      "og:title": "Bildungsgutschein einlösen | METROPOL Bildungszentrum",
      "og:description":
        "Mit dem Bildungsgutschein der Agentur für Arbeit oder vom Jobcenter zu 100 % geförderter Weiterbildung in Hannover, Garbsen und Bremen.",
      "og:type": "website",
      "og:url": PAGE_URL,
    };

    const created: HTMLElement[] = [];
    Object.entries(metaTags).forEach(([name, content]) => {
      const attr = name.startsWith("og:") ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
        created.push(tag);
      }
      tag.content = content;
    });

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanonical = canonical?.href;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.href = PAGE_URL;

    const scripts = [
      generateBreadcrumbData([
        { name: "Startseite", url: SITE_URL },
        { name: "Bildungsgutschein", url: PAGE_URL },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: bildungsgutscheinFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Geförderte Weiterbildung mit Bildungsgutschein",
        description:
          "AZAV-zertifizierte Weiterbildungen mit Bildungsgutschein der Agentur für Arbeit oder des Jobcenters: LKW-Führerschein Klasse C/CE, Busführerschein Klasse D/DE, beschleunigte Grundqualifikation, BKF-Module 1–5 und Fahrlehrer-Ausbildung.",
        provider: {
          "@type": "Organization",
          name: "METROPOL Bildungszentrum GmbH",
          url: SITE_URL,
        },
        courseMode: "onsite",
        availableLanguage: ["German"],
        url: PAGE_URL,
        offers: {
          "@type": "Offer",
          category: "Bildungsgutschein / AZAV-Förderung",
          price: "0",
          priceCurrency: "EUR",
          url: PAGE_URL,
        },
      },
    ].map((data, i) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-structured-data", `bildungsgutschein-${i}`);
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });

    return () => {
      created.forEach((t) => t.parentNode?.removeChild(t));
      scripts.forEach((s) => s.parentNode?.removeChild(s));
      if (canonical && prevCanonical) canonical.href = prevCanonical;
    };
  }, []);
  return null;
}

const steps = [
  {
    icon: Phone,
    title: "Kostenlose Beratung",
    text: "Wir klären in 10 Minuten, welche geförderte Weiterbildung zu Ihnen passt – LKW, Bus, Berufskraftfahrer oder Fahrlehrer (m/w/d).",
  },
  {
    icon: FileCheck,
    title: "Bildungsgutschein beantragen",
    text: "Sie erhalten von uns ein Angebot mit Maßnahmennummer und allen AZAV-Nachweisen für Agentur für Arbeit oder Jobcenter.",
  },
  {
    icon: GraduationCap,
    title: "Bildungsgutschein einlösen",
    text: "Nach Bewilligung starten Sie in Hannover, Garbsen oder Bremen – wir übernehmen Anmeldung und Abrechnung mit dem Kostenträger.",
  },
  {
    icon: CheckCircle2,
    title: "Abschluss & neuer Job",
    text: "Prüfung bestanden, Zertifikat erhalten – und mit unserem Arbeitgeber-Netzwerk direkt in den neuen Beruf starten.",
  },
];

const foerderKurse = [
  { name: "LKW-Führerschein Klasse C / CE (m/w/d)", href: "/fuehrerschein/c-ce" },
  { name: "Klasse C1 / C1E (m/w/d)", href: "/fuehrerschein/c1-c1e" },
  { name: "Busführerschein Klasse D / DE (m/w/d)", href: "/fuehrerschein/d-de" },
  {
    name: "Beschleunigte Grundqualifikation nach BKrFQG",
    href: "/fuehrerschein/beschleunigte-grundqualifikation-nach-bkrfqg",
  },
  {
    name: "BKF-Weiterbildung Module 1–5",
    href: "/fuehrerschein/bkf-weiterbildung-module-1-5-nach-bkrfqg",
  },
  { name: "Fahrlehrer-Ausbildung (m/w/d)", href: "/fahrlehrer-ausbildung" },
];

const standorte = [
  { name: "Hannover", href: "/standort/hannover" },
  { name: "Garbsen", href: "/standort/garbsen" },
  { name: "Bremen", href: "/standort/bremen" },
];

export default function BildungsgutscheinPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <BildungsgutscheinMeta />
      <Header />
      <main id="bildungsgutschein">
        {/* Hero */}
        <section className="pt-32 pb-16 bg-secondary" aria-labelledby="bg-title">
          <div className="container mx-auto px-4">
            <nav aria-label="Brotkrumen" className="mb-6 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link to="/" className="hover:text-primary">Startseite</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground">Bildungsgutschein</li>
              </ol>
            </nav>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                <CreditCard className="h-4 w-4" />
                AZAV-zertifiziert – 100 % Förderung möglich
              </span>
              <h1 id="bg-title" className="text-4xl md:text-5xl font-bold mb-6">
                Bildungsgutschein einlösen – geförderte Weiterbildung in Hannover,
                Garbsen &amp; Bremen
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Mit dem <strong>Bildungsgutschein der Agentur für Arbeit</strong> oder
                vom <strong>Jobcenter</strong> finanzieren Sie Ihre Weiterbildung beim
                METROPOL Bildungszentrum zu 100 %. Wir sind ein nach AZAV zugelassener
                Bildungsträger und begleiten Sie vom Antrag bis zum Abschluss.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link to="/kontakt?anliegen=bildungsgutschein">
                    Kostenlose Förder-Beratung
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#bildungsgutschein-beantragen">Bildungsgutschein beantragen</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Was ist ein Bildungsgutschein */}
        <section className="py-16" aria-labelledby="bg-was-ist">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 id="bg-was-ist" className="text-3xl font-bold mb-4">
              Was ist ein Bildungsgutschein?
            </h2>
            <p className="text-muted-foreground mb-4">
              Der Bildungsgutschein ist eine schriftliche Förderzusage der Agentur für
              Arbeit oder des Jobcenters. Er sichert Ihnen zu, dass die Kosten einer
              zugelassenen <strong>Bildungsgutschein-Weiterbildung</strong> vollständig
              übernommen werden – inklusive Lehrgangs-, Prüfungs- und häufig auch
              Fahrtkosten.
            </p>
            <p className="text-muted-foreground">
              Sie sind dabei an keinen bestimmten Anbieter gebunden: Sie wählen den
              AZAV-zertifizierten Bildungsträger frei aus. Beim METROPOL
              Bildungszentrum lösen Sie Ihren Bildungsgutschein für Führerschein-,
              Berufskraftfahrer- und Fahrlehrer-Qualifizierungen ein.
            </p>
          </div>
        </section>

        {/* Beantragen */}
        <section
          id="bildungsgutschein-beantragen"
          className="py-16 bg-secondary scroll-mt-24"
          aria-labelledby="bg-beantragen"
        >
          <div className="container mx-auto px-4">
            <h2 id="bg-beantragen" className="text-3xl font-bold mb-10 text-center">
              Bildungsgutschein beantragen &amp; einlösen – in 4 Schritten
            </h2>
            <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 list-none">
              {steps.map((step, i) => (
                <AnimatedSection key={step.title} delay={i * 100}>
                  <li className="h-full p-6 rounded-xl bg-card border border-border">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      {i + 1}. {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.text}
                    </p>
                  </li>
                </AnimatedSection>
              ))}
            </ol>
          </div>
        </section>

        {/* Geförderte Kurse */}
        <section className="py-16" aria-labelledby="bg-kurse">
          <div className="container mx-auto px-4">
            <h2 id="bg-kurse" className="text-3xl font-bold mb-4 text-center">
              Diese Weiterbildungen sind mit Bildungsgutschein förderfähig
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Alle Maßnahmen sind AZAV-zertifiziert und damit über Bildungsgutschein
              der Agentur für Arbeit oder des Jobcenters förderfähig.
            </p>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {foerderKurse.map((k) => (
                <li key={k.href}>
                  <Link
                    to={k.href}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                  >
                    <Award className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{k.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-14 mb-4 text-center">
              Bildungsgutschein einlösen an unseren Standorten
            </h3>
            <ul className="flex flex-wrap justify-center gap-3">
              {standorte.map((s) => (
                <li key={s.href}>
                  <Link
                    to={s.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/40 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    Bildungsgutschein {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary" aria-labelledby="bg-faq">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 id="bg-faq" className="text-3xl font-bold mb-8 text-center">
              Häufige Fragen zum Bildungsgutschein
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {bildungsgutscheinFaqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center">
              <Button asChild size="lg">
                <Link to="/kontakt?anliegen=bildungsgutschein">
                  Jetzt Bildungsgutschein einlösen
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </div>
  );
}