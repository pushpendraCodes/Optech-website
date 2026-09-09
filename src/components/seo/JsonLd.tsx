import { SITE, SITE_DESCRIPTION, SITE_TITLE, absUrl, siteUrl } from "@/lib/seo";

function jsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function SeoJsonLd() {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "@id": `${siteUrl}/#institute`,
        name: SITE.legalName,
        legalName: `${SITE.legalName}, Deori`,
        alternateName: [
          SITE.shortName,
          SITE.brand,
          "OPTECH COMPUTER INSTITUTE OF TECHNOLOGY DEORI",
          "Optech Computer Institute of Technology Deori",
        ],
        url: siteUrl,
        logo: absUrl("/logo.webp"),
        image: absUrl("/logo.webp"),
        email: SITE.email,
        telephone: SITE.telephone,
        foundingDate: SITE.foundingYear,
        slogan: "Industry-recognized computer education in Deori since 1994",
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.streetAddress,
          addressLocality: SITE.locality,
          addressRegion: SITE.region,
          postalCode: SITE.postalCode,
          addressCountry: SITE.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        hasMap: SITE.googleMaps,
        areaServed: [
          { "@type": "City", name: "Deori" },
          { "@type": "AdministrativeArea", name: "Gondia" },
          { "@type": "State", name: "Maharashtra" },
        ],
        sameAs: [SITE.googleMaps],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#institute` },
        inLanguage: ["en-IN", "hi-IN", "mr-IN"],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(org)} />;
}
