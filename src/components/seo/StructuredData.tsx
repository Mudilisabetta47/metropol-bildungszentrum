import { useEffect } from "react";

const SITE_URL = "https://metropol-bz.de";

const organizationData = {
  "@context": "https://schema.org",
  "@type": "DrivingSchool",
  "@id": `${SITE_URL}/#organization`,
  name: "METROPOL Bildungszentrum GmbH",
  alternateName: "Metropol BZ",
  description: "Ihr Partner für professionelle Berufskraftfahrer-Ausbildung, Fahrlehrer-Ausbildung und BKF-Weiterbildung in Niedersachsen und Bremen.",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.webp`,
  image: `${SITE_URL}/favicon.webp`,
  telephone: "+49 511 6425068",
  email: "info@metropol-bz.de",
  foundingDate: "2020",
  priceRange: "€€",
  paymentAccepted: ["Cash", "Bank Transfer"],
  currenciesAccepted: "EUR",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "127",
    reviewCount: "127"
  },
  areaServed: [
    { "@type": "State", name: "Niedersachsen", containedInPlace: { "@type": "Country", name: "Deutschland" } },
    { "@type": "State", name: "Bremen", containedInPlace: { "@type": "Country", name: "Deutschland" } }
  ],
  sameAs: [
    "https://www.facebook.com/metropolbildungszentrum",
    "https://www.instagram.com/metropolbildungszentrum",
    "https://www.google.com/maps/place/METROPOL+Bildungszentrum+GmbH"
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Vahrenwalder Str. 213",
    addressLocality: "Hannover",
    postalCode: "30165",
    addressCountry: "DE"
  },
  geo: { "@type": "GeoCoordinates", latitude: "52.4012", longitude: "9.7387" },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "16:30"
  }],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49 511 6425068",
    contactType: "customer service",
    availableLanguage: ["German", "English", "Turkish"]
  },
  founder: { "@type": "Person", name: "Vedat Özel", jobTitle: "Geschäftsführer" }
};

const locationsData = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#location-hannover`,
    name: "METROPOL Bildungszentrum Hannover",
    description: "Fahrlehrer-Ausbildung, LKW-Führerschein und BKF-Weiterbildung in Hannover",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    address: { "@type": "PostalAddress", streetAddress: "Vahrenwalder Str. 213", addressLocality: "Hannover", postalCode: "30165", addressCountry: "DE" },
    telephone: "+49 511 6425068",
    url: `${SITE_URL}/standort/hannover`
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#location-bremen`,
    name: "METROPOL Bildungszentrum Bremen",
    description: "Fahrlehrer-Ausbildung, Bus-Führerschein und BKF-Weiterbildung in Bremen",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    address: { "@type": "PostalAddress", streetAddress: "Bahnhofsplatz 41", addressLocality: "Bremen", postalCode: "28195", addressCountry: "DE" },
    url: `${SITE_URL}/standort/bremen`
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#location-garbsen`,
    name: "METROPOL Bildungszentrum Garbsen",
    description: "Fahrlehrer-Ausbildung und Berufskraftfahrer-Ausbildung in Garbsen",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    address: { "@type": "PostalAddress", streetAddress: "Planetenring 25-27", addressLocality: "Garbsen", postalCode: "30823", addressCountry: "DE" },
    url: `${SITE_URL}/standort/garbsen`
  }
];

const coursesData = [
  {
    "@context": "https://schema.org", "@type": "Course", "@id": `${SITE_URL}/#course-c-ce`,
    name: "LKW-Führerschein Klasse C/CE",
    description: "Professionelle Ausbildung zum Berufskraftfahrer mit LKW-Führerschein Klasse C und CE.",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalCredentialAwarded: "Führerschein Klasse C/CE",
    occupationalCategory: "Berufskraftfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: `${SITE_URL}/fuehrerschein/c-ce`,
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "onsite", location: { "@id": `${SITE_URL}/#location-hannover` } }
  },
  {
    "@context": "https://schema.org", "@type": "Course", "@id": `${SITE_URL}/#course-d-de`,
    name: "Bus-Führerschein Klasse D/DE",
    description: "Ausbildung zum Busfahrer mit Führerschein Klasse D und DE.",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalCredentialAwarded: "Führerschein Klasse D/DE",
    occupationalCategory: "Busfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: `${SITE_URL}/fuehrerschein/d-de`
  },
  {
    "@context": "https://schema.org", "@type": "Course", "@id": `${SITE_URL}/#course-fahrlehrer`,
    name: "Fahrlehrer-Ausbildung",
    description: "Staatlich anerkannte Fahrlehrerausbildung mit theoretischer und praktischer Ausbildung.",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalCredentialAwarded: "Fahrlehrerschein",
    occupationalCategory: "Fahrlehrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: `${SITE_URL}/fuehrerschein/fahrlehrer`
  },
  {
    "@context": "https://schema.org", "@type": "Course", "@id": `${SITE_URL}/#course-bkf`,
    name: "BKF-Weiterbildung Module 1-5",
    description: "Gesetzlich vorgeschriebene Berufskraftfahrer-Weiterbildung nach BKrFQG.",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalCredentialAwarded: "BKF-Weiterbildungsbescheinigung",
    occupationalCategory: "Berufskraftfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: `${SITE_URL}/fuehrerschein/bkf-weiterbildung`,
    timeRequired: "P5D"
  },
  {
    "@context": "https://schema.org", "@type": "Course", "@id": `${SITE_URL}/#course-sprache`,
    name: "Sprachkurse für Berufskraftfahrer",
    description: "Deutschkurse speziell für Berufskraftfahrer mit fachspezifischem Vokabular.",
    provider: { "@id": `${SITE_URL}/#organization` },
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: `${SITE_URL}/fuehrerschein/sprachkurse`
  }
];

export function generateBreadcrumbData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function injectSchema(id: string, data: object) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-structured-data", id);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function StructuredData() {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    const inject = (id: string, data: object) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-structured-data", id);
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      scripts.push(script);
    };

    inject("organization", organizationData);
    locationsData.forEach((loc, i) => inject(`location-${i}`, loc));
    coursesData.forEach((course, i) => inject(`course-${i}`, course));

    return () => {
      scripts.forEach(s => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, []);

  return null;
}

export { organizationData, locationsData, coursesData, SITE_URL };
