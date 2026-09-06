import type { Metadata } from "next";

const pageTitle = "Warranty Directory & RMA Assistance | Charmila Computers";
const pageDescription =
  "Official brand warranty directory, toll-free customer helplines, and RMA assistance for Intel, AMD, ASUS, MSI, Gigabyte, Corsair & WD at Charmila Computers.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/warranty-rma" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://charmilacomputers.in/warranty-rma",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const warrantyJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://charmilacomputers.in/warranty-rma/#webpage",
      url: "https://charmilacomputers.in/warranty-rma",
      name: pageTitle,
      description: pageDescription,
      isPartOf: { "@id": "https://charmilacomputers.in/#website" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://charmilacomputers.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Warranty & RMA Center",
          item: "https://charmilacomputers.in/warranty-rma",
        },
      ],
    },
  ],
};

export default function WarrantyRmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(warrantyJsonLd) }}
      />
      {children}
    </>
  );
}
