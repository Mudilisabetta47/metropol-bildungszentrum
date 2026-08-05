import { CreditCard, ArrowLeftRight, CheckCircle2, FileCheck, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    icon: Phone,
    title: "1. Kostenlose Beratung",
    description:
      "Wir klären in 10 Minuten, welche Ausbildung zu Ihnen passt – LKW, Bus, Berufskraftfahrer oder Fahrlehrer (m/w/d).",
  },
  {
    icon: FileCheck,
    title: "2. Bildungsgutschein beantragen",
    description:
      "Sie erhalten von uns ein Angebot und alle AZAV-Nachweise für Agentur für Arbeit oder Jobcenter – wir helfen beim Antrag.",
  },
  {
    icon: ArrowLeftRight,
    title: "3. Wechsel oder Start",
    description:
      "Sie starten bei uns – auch mitten in der Ausbildung. Ein Fahrschulwechsel mit Bildungsgutschein ist jederzeit möglich.",
  },
  {
    icon: CheckCircle2,
    title: "4. Führerschein in der Tasche",
    description:
      "Prüfung bestanden, Zertifikat erhalten – und mit unserem Netzwerk direkt in den neuen Job starten.",
  },
];

const faqs = [
  {
    q: "Kann ich mit einem Bildungsgutschein der Agentur für Arbeit zu METROPOL kommen?",
    a: "Ja. METROPOL Bildungszentrum ist ein AZAV-zertifizierter Bildungsträger in Hannover, Garbsen und Bremen. Ihr Bildungsgutschein von der Agentur für Arbeit oder vom Jobcenter wird bei uns für alle geförderten Maßnahmen anerkannt – von der LKW-Ausbildung (Klasse C/CE) über die Busausbildung (Klasse D/DE) bis zur Berufskraftfahrer-Weiterbildung und Fahrlehrer-Ausbildung.",
  },
  {
    q: "Ist ein Fahrschulwechsel mit Bildungsgutschein möglich?",
    a: "Ja. Sie sind an keine Fahrschule gebunden. Sie können Ihren Bildungsgutschein frei bei jedem zugelassenen Träger einlösen und jederzeit zu uns wechseln – auch wenn Ihre Ausbildung bereits läuft. Bereits absolvierte Theorie- und Praxisstunden rechnen wir nach Prüfung an, damit nichts verloren geht.",
  },
  {
    q: "Was kostet mich die Ausbildung mit Bildungsgutschein?",
    a: "In der Regel nichts. Bei einer Förderung durch Agentur für Arbeit oder Jobcenter werden die Lehrgangskosten zu 100 % übernommen. Wir sind zudem nach §4 Nr. 21 UStG umsatzsteuerbefreit – es entstehen keine versteckten Mehrwertsteuerkosten.",
  },
  {
    q: "Wie schnell kann ich starten?",
    a: "Sobald der Bildungsgutschein vorliegt, können Sie an unseren Standorten Hannover, Garbsen und Bremen meist innerhalb weniger Tage einsteigen. Bei laufenden Kursen prüfen wir kurzfristig freie Plätze für Sie.",
  },
  {
    q: "Welche Unterlagen brauche ich für den Wechsel?",
    a: "Bildungsgutschein, Personalausweis, vorhandener Führerschein sowie – falls vorhanden – der Ausbildungsnachweis Ihrer bisherigen Fahrschule. Alles Weitere übernehmen wir für Sie.",
  },
];

export function Bildungsgutschein() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      id="bildungsgutschein"
      className="py-20 bg-secondary"
      aria-labelledby="bildungsgutschein-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <CreditCard className="h-4 w-4" />
              100 % Förderung möglich
            </span>
            <h2
              id="bildungsgutschein-heading"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Bildungsgutschein einlösen &amp; Fahrschule wechseln
            </h2>
            <p className="text-lg text-muted-foreground">
              Mit dem <strong>Bildungsgutschein der Agentur für Arbeit</strong> oder
              vom <strong>Jobcenter</strong> starten Sie bei uns in Hannover, Garbsen
              und Bremen kostenfrei durch. Und falls Sie unzufrieden sind: Ein{" "}
              <strong>Fahrschulwechsel</strong> ist jederzeit möglich – auch mitten
              in der laufenden Ausbildung.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 100}>
              <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Häufige Fragen zu Bildungsgutschein &amp; Fahrschulwechsel
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/kontakt?anliegen=bildungsgutschein">
                  Kostenlose Förder-Beratung
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/kontakt?anliegen=fahrschulwechsel">
                  Jetzt Fahrschule wechseln
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}