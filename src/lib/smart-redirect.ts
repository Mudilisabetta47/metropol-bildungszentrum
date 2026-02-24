/**
 * Smart redirect: analyzes an unknown URL path and finds the best matching known route.
 * Uses keyword extraction, fuzzy matching, and weighted scoring.
 */

interface KnownRoute {
  path: string;
  keywords: string[];
  label: string;
}

const KNOWN_ROUTES: KnownRoute[] = [
  // Main pages
  { path: "/", keywords: ["home", "start", "startseite", "hauptseite", "index", "metropol"], label: "Startseite" },
  { path: "/ueber-uns", keywords: ["ueber", "uns", "about", "team", "unternehmen", "firma", "wer", "sind"], label: "Über uns" },
  { path: "/kontakt", keywords: ["kontakt", "contact", "anfrage", "erreichen", "schreiben", "mail", "telefon", "anfahrt"], label: "Kontakt" },
  { path: "/impressum", keywords: ["impressum", "imprint", "legal", "rechtlich"], label: "Impressum" },
  { path: "/datenschutz", keywords: ["datenschutz", "privacy", "dsgvo", "cookies", "daten"], label: "Datenschutz" },

  // Locations
  { path: "/standort/hannover", keywords: ["hannover", "standort", "location", "filiale"], label: "Standort Hannover" },
  { path: "/standort/bremen", keywords: ["bremen", "standort", "location", "filiale"], label: "Standort Bremen" },
  { path: "/standort/garbsen", keywords: ["garbsen", "standort", "location", "filiale"], label: "Standort Garbsen" },

  // LKW
  { path: "/fuehrerschein/c-ce", keywords: ["lkw", "c", "ce", "truck", "lastwagen", "fuehrerschein", "klasse"], label: "Führerschein C/CE" },
  { path: "/fuehrerschein/c1-c1e", keywords: ["c1", "c1e", "leicht", "lkw", "fuehrerschein", "klasse"], label: "Führerschein C1/C1E" },

  // Bus
  { path: "/fuehrerschein/d-de", keywords: ["bus", "d", "de", "personenbefoerderung", "omnibus", "fuehrerschein", "klasse"], label: "Führerschein D/DE" },

  // Spezial
  { path: "/fuehrerschein/citylogistiker", keywords: ["city", "logistik", "logistiker", "stadtverkehr", "lieferung"], label: "Citylogistiker" },
  { path: "/fuehrerschein/auslieferungsfahrer", keywords: ["auslieferung", "fahrer", "lieferung", "kurier", "paket"], label: "Auslieferungsfahrer" },

  // Fahrlehrer
  { path: "/fuehrerschein/fahrlehrer-ce", keywords: ["fahrlehrer", "ce", "ausbildung", "lehrer"], label: "Fahrlehrer CE" },
  { path: "/fuehrerschein/fahrlehrer-de", keywords: ["fahrlehrer", "de", "bus", "ausbildung", "lehrer"], label: "Fahrlehrer DE" },
  { path: "/fuehrerschein/fahrlehrer-ausbildung-be", keywords: ["fahrlehrer", "be", "ausbildung", "pkw", "lehrer"], label: "Fahrlehrer BE" },
  { path: "/fuehrerschein/fahrlehrer-a", keywords: ["fahrlehrer", "a", "motorrad", "ausbildung", "lehrer"], label: "Fahrlehrer A" },
  { path: "/fuehrerschein/fahrlehrer-fortbildungslehrgang-53-abs-1", keywords: ["fahrlehrer", "fortbildung", "53", "lehrgang"], label: "Fahrlehrer-Fortbildung §53 Abs.1" },
  { path: "/fuehrerschein/fortbildungslehrgang-fuer-ausbildungsfahrlehrer-53-abs-3", keywords: ["ausbildungsfahrlehrer", "fortbildung", "53", "abs", "3"], label: "Ausbildungsfahrlehrer-Fortbildung §53 Abs.3" },
  { path: "/fuehrerschein/fahrlehrer-fortbildungslehrgang-nach-7-bkrfqv", keywords: ["fahrlehrer", "fortbildung", "7", "bkrfqv"], label: "Fahrlehrer-Fortbildung §7 BKrFQV" },

  // BKF
  { path: "/fuehrerschein/beschleunigte-grundqualifikation-nach-bkrfqg", keywords: ["beschleunigte", "grundqualifikation", "bkrfqg", "bkf", "95"], label: "Beschleunigte Grundqualifikation" },
  { path: "/fuehrerschein/bkf-weiterbildung-module-1-5-nach-bkrfqg", keywords: ["bkf", "weiterbildung", "module", "1", "5", "komplett", "alle"], label: "BKF Module 1–5" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-1-intelligent-fahren", keywords: ["bkf", "modul", "1", "intelligent", "fahren"], label: "BKF Modul 1 – Intelligent fahren" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-1-eco-training-assistenzsysteme", keywords: ["bkf", "modul", "1", "eco", "training", "assistenz"], label: "BKF Modul 1 – Eco-Training" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-2-sozialvorschriften-fahrtenschreiber", keywords: ["bkf", "modul", "2", "sozialvorschriften", "fahrtenschreiber"], label: "BKF Modul 2 – Sozialvorschriften" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-2-rechtssicher-dokumentieren", keywords: ["bkf", "modul", "2", "rechtssicher", "dokumentieren"], label: "BKF Modul 2 – Dokumentieren" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-3-sicher-gesund-unterwegs", keywords: ["bkf", "modul", "3", "sicher", "gesund", "unterwegs"], label: "BKF Modul 3 – Sicher & gesund" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-3-sicher-und-gesund-unterwegs", keywords: ["bkf", "modul", "3", "sicher", "gesund", "unterwegs"], label: "BKF Modul 3 – Sicher & gesund" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-4-professionell-kundenorientiert", keywords: ["bkf", "modul", "4", "professionell", "kundenorientiert", "kunden"], label: "BKF Modul 4 – Kundenorientiert" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-5-gueterverkehr-spezial", keywords: ["bkf", "modul", "5", "gueterverkehr", "gueter", "spezial"], label: "BKF Modul 5 – Güterverkehr" },
  { path: "/fuehrerschein/bkf-weiterbildung-modul-5-personenverkehr-spezial", keywords: ["bkf", "modul", "5", "personenverkehr", "personen", "spezial"], label: "BKF Modul 5 – Personenverkehr" },
];

// Common URL character replacements for normalization
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(path: string): string[] {
  return normalize(path).split(" ").filter(t => t.length > 1);
}

// Simple Levenshtein for short strings
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return d[m][n];
}

function fuzzyMatch(token: string, keyword: string): number {
  if (keyword === token) return 1;
  if (keyword.includes(token) || token.includes(keyword)) return 0.7;
  const dist = levenshtein(token, keyword);
  const maxLen = Math.max(token.length, keyword.length);
  const similarity = 1 - dist / maxLen;
  return similarity > 0.6 ? similarity * 0.5 : 0;
}

export interface RedirectMatch {
  path: string;
  label: string;
  score: number;
  confidence: "high" | "medium" | "low";
}

export function findBestRedirect(unknownPath: string): RedirectMatch | null {
  const tokens = extractTokens(unknownPath);
  if (tokens.length === 0) return null;

  let bestScore = 0;
  let bestRoute: KnownRoute | null = null;

  for (const route of KNOWN_ROUTES) {
    let score = 0;
    const allKeywords = [...route.keywords, ...extractTokens(route.path)];
    
    for (const token of tokens) {
      let maxMatch = 0;
      for (const kw of allKeywords) {
        maxMatch = Math.max(maxMatch, fuzzyMatch(token, kw));
      }
      score += maxMatch;
    }
    
    // Normalize by token count to avoid bias toward long URLs
    const normalizedScore = tokens.length > 0 ? score / tokens.length : 0;
    
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestRoute = route;
    }
  }

  if (!bestRoute || bestScore < 0.15) return null;

  const confidence: "high" | "medium" | "low" =
    bestScore >= 0.6 ? "high" : bestScore >= 0.35 ? "medium" : "low";

  return {
    path: bestRoute.path,
    label: bestRoute.label,
    score: bestScore,
    confidence,
  };
}

export function findTopRedirects(unknownPath: string, count = 3): RedirectMatch[] {
  const tokens = extractTokens(unknownPath);
  if (tokens.length === 0) return [];

  const scored: RedirectMatch[] = [];

  for (const route of KNOWN_ROUTES) {
    let score = 0;
    const allKeywords = [...route.keywords, ...extractTokens(route.path)];
    
    for (const token of tokens) {
      let maxMatch = 0;
      for (const kw of allKeywords) {
        maxMatch = Math.max(maxMatch, fuzzyMatch(token, kw));
      }
      score += maxMatch;
    }
    
    const normalizedScore = tokens.length > 0 ? score / tokens.length : 0;
    if (normalizedScore < 0.15) continue;

    scored.push({
      path: route.path,
      label: route.label,
      score: normalizedScore,
      confidence: normalizedScore >= 0.6 ? "high" : normalizedScore >= 0.35 ? "medium" : "low",
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}
