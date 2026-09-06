import type { Metadata } from "next";

const pageTitle = "Compare PC Components & Hardware Specs | Charmila Computers";
const pageDescription =
  "Compare processors, graphics cards, motherboards, RAM, and SSD specifications side-by-side with wattage calculation and real-time prices at Charmila Computers.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/compare" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.charmilacomputers.in/compare",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const compareJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.charmilacomputers.in/compare/#webpage",
      url: "https://www.charmilacomputers.in/compare",
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
          name: "Compare Products",
          item: "https://www.charmilacomputers.in/compare",
        },
      ],
    },
  ],
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      {children}
    </>
  );
}
