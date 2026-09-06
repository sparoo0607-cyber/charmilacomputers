import type { Metadata } from "next";

const pageTitle = "Hardware Deals, Flash Sales & Combo Offers | Charmila Computers";
const pageDescription =
  "Explore discounted prices on gaming processors, graphics cards, RAM kits, SSDs, and pre-configured PC upgrade bundles from Charmila Computers with manufacturer warranty.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/deals" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.charmilacomputers.in/deals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const dealsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.charmilacomputers.in/deals/#webpage",
      url: "https://www.charmilacomputers.in/deals",
      name: pageTitle,
      description: pageDescription,
      isPartOf: { "@id": "https://www.charmilacomputers.in/#website" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.charmilacomputers.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Deals & Offers",
          item: "https://www.charmilacomputers.in/deals",
        },
      ],
    },
  ],
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsJsonLd) }}
      />
      {children}
    </>
  );
}
