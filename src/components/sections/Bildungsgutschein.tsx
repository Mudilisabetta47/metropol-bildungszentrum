import { CreditCard, GraduationCap, CheckCircle2, FileCheck, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { bildungsgutscheinFaqs } from "@/data/bildungsgutschein";

const faqs = bildungsgutscheinFaqs.slice(0, 5);

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
    icon: GraduationCap,
    title: "3. Ausbildung starten",
    description:
      "Nach Bewilligung geht es los – mit festen Kursterminen an unseren Standorten Hannover, Garbsen und Bremen.",
  },
  {
    icon: CheckCircle2,
    title: "4. Führerschein in der Tasche",
    description:
      "Prüfung bestanden, Zertifikat erhalten – und mit unserem Netzwerk direkt in den neuen Job starten.",
  },
];

export function Bildungsgutschein() {
  return (
    <section
      id="bildungsgutschein"
      className="py-20 bg-secondary"
      aria-labelledby="bildungsgutschein-heading"
    >
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
              Bildungsgutschein einlösen
            </h2>
            <p className="text-lg text-muted-foreground">
              Mit dem <strong>Bildungsgutschein der Agentur für Arbeit</strong> oder
              vom <strong>Jobcenter</strong> starten Sie bei uns in Hannover, Garbsen
              und Bremen in Ihre neue berufliche Zukunft.
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
              Häufige Fragen zum Bildungsgutschein
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
                <Link to="/bildungsgutschein">
                  Alles zum Bildungsgutschein
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}