import type { Metadata } from "next";
import BuildYourPc from "./BuildYourPc";
import Link from "next/link";

const pageTitle = "Custom PC Builder & Compatibility Configurator | Charmila Computers";
const pageDescription =
  "Build your custom gaming PC, workstation, or office desktop with live compatibility checks, wattage calculator, and instant pricing from Charmila Computers.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/build-your-pc" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://charmilacomputers.in/build-your-pc",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const pcBuilderJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://charmilacomputers.in/build-your-pc/#app",
      name: "Charmila Computers Custom PC Builder",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web Browser",
      url: "https://charmilacomputers.in/build-your-pc",
      description: pageDescription,
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
          name: "Custom PC Builder",
          item: "https://charmilacomputers.in/build-your-pc",
        },
      ],
    },
  ],
};

export default function BuildYourPcPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pcBuilderJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Custom PC Builder</span>
      </nav>

      <BuildYourPc />
    </div>
  );
}
