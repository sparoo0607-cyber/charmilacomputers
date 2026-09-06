import type { Metadata } from "next";

const pageTitle = "Contact Charmila Computers | Store Location, Phone & Support";
const pageDescription =
  "Get in touch with Charmila Computers in Andhra Pradesh. Phone: +91 90101 77427, WhatsApp support, hardware quotations, repair services and store directions.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://charmilacomputers.in/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://charmilacomputers.in/contact/#webpage",
      url: "https://charmilacomputers.in/contact",
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
          name: "Contact Us",
          item: "https://charmilacomputers.in/contact",
        },
      ],
    },
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
