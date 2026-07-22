import {
  buildOrganizationJsonLd,
  buildSiteNavigationJsonLd,
  buildSportsEventJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/site-seo";

export function SeoJsonLd() {
  const payloads = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildSiteNavigationJsonLd(),
    buildSportsEventJsonLd(),
  ];

  return (
    <>
      {payloads.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
