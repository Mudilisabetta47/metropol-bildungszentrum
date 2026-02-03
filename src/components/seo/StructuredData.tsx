import { useEffect } from "react";

// Main organization/business data with Google review data
const organizationData = {
  "@context": "https://schema.org",
  "@type": "DrivingSchool",
  "@id": "https://metropol-bildungszentrum.lovable.app/#organization",
  name: "METROPOL Bildungszentrum GmbH",
  alternateName: "Metropol BZ",
  description: "Ihr Partner für professionelle Berufskraftfahrer-Ausbildung, Fahrlehrer-Ausbildung und BKF-Weiterbildung in Niedersachsen und Bremen.",
  url: "https://metropol-bildungszentrum.lovable.app",
  logo: "https://metropol-bildungszentrum.lovable.app/logo-metropol.webp",
  image: "https://metropol-bildungszentrum.lovable.app/logo-metropol.webp",
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
    {
      "@type": "State",
      name: "Niedersachsen",
      containedInPlace: { "@type": "Country", name: "Deutschland" }
    },
    {
      "@type": "State", 
      name: "Bremen",
      containedInPlace: { "@type": "Country", name: "Deutschland" }
    }
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
  geo: {
    "@type": "GeoCoordinates",
    latitude: "52.4012",
    longitude: "9.7387"
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "16:30"
    }
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49 511 6425068",
    contactType: "customer service",
    availableLanguage: ["German", "English", "Turkish"]
  },
  founder: {
    "@type": "Person",
    name: "Vedat Özel",
    jobTitle: "Geschäftsführer"
  }
};

// Location data for each branch
const locationsData = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://metropol-bildungszentrum.lovable.app/#location-hannover",
    name: "METROPOL Bildungszentrum Hannover",
    description: "Fahrlehrer-Ausbildung, LKW-Führerschein und BKF-Weiterbildung in Hannover",
    parentOrganization: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vahrenwalder Str. 213",
      addressLocality: "Hannover",
      postalCode: "30165",
      addressCountry: "DE"
    },
    telephone: "+49 511 6425068",
    url: "https://metropol-bildungszentrum.lovable.app/standort/hannover"
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://metropol-bildungszentrum.lovable.app/#location-bremen",
    name: "METROPOL Bildungszentrum Bremen",
    description: "Fahrlehrer-Ausbildung, Bus-Führerschein und BKF-Weiterbildung in Bremen",
    parentOrganization: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bahnhofsplatz 41",
      addressLocality: "Bremen",
      postalCode: "28195",
      addressCountry: "DE"
    },
    url: "https://metropol-bildungszentrum.lovable.app/standort/bremen"
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://metropol-bildungszentrum.lovable.app/#location-garbsen",
    name: "METROPOL Bildungszentrum Garbsen",
    description: "Fahrlehrer-Ausbildung und Berufskraftfahrer-Ausbildung in Garbsen",
    parentOrganization: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Planetenring 25-27",
      addressLocality: "Garbsen",
      postalCode: "30823",
      addressCountry: "DE"
    },
    url: "https://metropol-bildungszentrum.lovable.app/standort/garbsen"
  }
];

// Course data
const coursesData = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": "https://metropol-bildungszentrum.lovable.app/#course-c-ce",
    name: "LKW-Führerschein Klasse C/CE",
    description: "Professionelle Ausbildung zum Berufskraftfahrer mit LKW-Führerschein Klasse C und CE. Inklusive praktischer Fahrausbildung und Theorieunterricht.",
    provider: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    educationalCredentialAwarded: "Führerschein Klasse C/CE",
    occupationalCategory: "Berufskraftfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: "https://metropol-bildungszentrum.lovable.app/fuehrerschein/c-ce",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: { "@id": "https://metropol-bildungszentrum.lovable.app/#location-hannover" }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": "https://metropol-bildungszentrum.lovable.app/#course-d-de",
    name: "Bus-Führerschein Klasse D/DE",
    description: "Ausbildung zum Busfahrer mit Führerschein Klasse D und DE. Für Linienbusse und Reisebusse geeignet.",
    provider: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    educationalCredentialAwarded: "Führerschein Klasse D/DE",
    occupationalCategory: "Busfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: "https://metropol-bildungszentrum.lovable.app/fuehrerschein/d-de"
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": "https://metropol-bildungszentrum.lovable.app/#course-fahrlehrer",
    name: "Fahrlehrer-Ausbildung",
    description: "Werden Sie Fahrlehrer/in mit unserer staatlich anerkannten Fahrlehrerausbildung. Umfassende theoretische und praktische Ausbildung.",
    provider: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    educationalCredentialAwarded: "Fahrlehrerschein",
    occupationalCategory: "Fahrlehrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: "https://metropol-bildungszentrum.lovable.app/fuehrerschein/fahrlehrer"
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": "https://metropol-bildungszentrum.lovable.app/#course-bkf",
    name: "BKF-Weiterbildung Module 1-5",
    description: "Gesetzlich vorgeschriebene Berufskraftfahrer-Weiterbildung nach BKrFQG. Alle 5 Module für LKW- und Busfahrer.",
    provider: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    educationalCredentialAwarded: "BKF-Weiterbildungsbescheinigung",
    occupationalCategory: "Berufskraftfahrer",
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: "https://metropol-bildungszentrum.lovable.app/fuehrerschein/bkf-weiterbildung",
    timeRequired: "P5D"
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": "https://metropol-bildungszentrum.lovable.app/#course-sprache",
    name: "Sprachkurse für Berufskraftfahrer",
    description: "Deutschkurse speziell für Berufskraftfahrer. Fachspezifisches Vokabular und Prüfungsvorbereitung.",
    provider: { "@id": "https://metropol-bildungszentrum.lovable.app/#organization" },
    courseMode: "onsite",
    availableLanguage: ["German"],
    url: "https://metropol-bildungszentrum.lovable.app/fuehrerschein/sprachkurse"
  }
];

// Breadcrumb helper for SEO
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

// Main component that injects all structured data
export function StructuredData() {
  useEffect(() => {
    // Remove existing structured data scripts (if any)
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach(script => script.remove());

    // Inject organization data
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-structured-data', 'organization');
    orgScript.textContent = JSON.stringify(organizationData);
    document.head.appendChild(orgScript);

    // Inject locations data
    locationsData.forEach((location, index) => {
      const locScript = document.createElement('script');
      locScript.type = 'application/ld+json';
      locScript.setAttribute('data-structured-data', `location-${index}`);
      locScript.textContent = JSON.stringify(location);
      document.head.appendChild(locScript);
    });

    // Inject courses data
    coursesData.forEach((course, index) => {
      const courseScript = document.createElement('script');
      courseScript.type = 'application/ld+json';
      courseScript.setAttribute('data-structured-data', `course-${index}`);
      courseScript.textContent = JSON.stringify(course);
      document.head.appendChild(courseScript);
    });

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[data-structured-data]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return null;
}

// Export individual data for use in specific pages
export { organizationData, locationsData, coursesData };
