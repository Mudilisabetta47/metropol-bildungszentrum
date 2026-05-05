import { Link } from "react-router-dom";
import { seoKeywords } from "@/data/seoKeywords";

/**
 * Renders a large, semantically meaningful keyword cloud for SEO.
 * All terms link to relevant landing pages so the section provides
 * real user value (navigation) as well as topical relevance for
 * search engines targeting Hannover, Bremen, Garbsen and the
 * surrounding region.
 */
function pickHref(keyword: string): string {
  const k = keyword.toLowerCase();
  if (k.includes("fahrlehrer")) return "/fahrlehrer-ausbildung";
  if (k.includes("bus") || k.includes("klasse d")) return "/fuehrerschein/d-de";
  if (k.includes("c1")) return "/fuehrerschein/c1-c1e";
  if (k.includes("bkf") || k.includes("grundqualifikation") || k.includes("bkrfqg")) return "/fuehrerschein/bkf-weiterbildung";
  if (k.includes("citylogistik")) return "/fuehrerschein/citylogistiker";
  if (k.includes("auslieferung")) return "/fuehrerschein/auslieferungsfahrer";
  if (k.includes("bremen")) return "/standort/bremen";
  if (k.includes("garbsen")) return "/standort/garbsen";
  if (k.includes("hannover") || k.includes("region")) return "/standort/hannover";
  return "/fuehrerschein/c-ce";
}

export function SeoKeywordCloud() {
  return (
    <section
      aria-label="Themen und Standorte"
      className="border-t border-primary-foreground/10 bg-primary text-primary-foreground"
    >
      <div className="section-container py-10">
        <h2 className="font-display font-semibold text-sm text-primary-foreground/70 mb-4 uppercase tracking-wider">
          Beliebte Suchbegriffe rund um Berufskraftfahrer-, Bus- und Fahrlehrer-Ausbildung
        </h2>
        <p className="text-xs text-primary-foreground/60 mb-6 max-w-4xl">
          METROPOL Bildungszentrum ist Ihre AZAV-zertifizierte Fahrschule und Ihr
          Bildungszentrum für Verkehrsberufe in Hannover, Bremen, Garbsen und der
          gesamten Region Niedersachsen. Wir bilden mit Bildungsgutschein der
          Agentur für Arbeit und des Jobcenters aus – vom LKW-Führerschein über
          die Bus-Ausbildung bis zur Fahrlehrer-Ausbildung und BKF-Weiterbildung.
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {seoKeywords.map((kw) => (
            <Link
              key={kw}
              to={pickHref(kw)}
              className="text-[11px] leading-tight text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              {kw}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
