import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat, Cinzel, Inter, Outfit } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import Toast from "@/components/Toast";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { getServerTheme } from "@/lib/theme-server";

// The active theme lives in Supabase and can be flipped from the admin panel at
// any time, so the shell must render per-request to stamp the right data-theme.
export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body-festive",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const cinzel = Cinzel({
  variable: "--font-festive-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-corporate-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-corporate-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});


const siteUrl = "https://charmilacomputers.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Charmila Computers | Computer Sales, Service & Custom PC Builds",
    template: "%s | Charmila Computers",
  },
  description:
    "Charmila Computers provides computer sales, repair, hardware upgrades, and custom PC builds in Andhra Pradesh, India. 100% genuine components with official manufacturer warranty.",
  keywords: [
    "Charmila Computers",
    "computer sales Andhra Pradesh",
    "computer repair Andhra Pradesh",
    "laptop repair",
    "custom PC builder India",
    "PC components India",
    "graphics cards",
    "processors",
    "motherboards",
    "gaming PC India",
    "computer shop",
    "computer store",
  ],
  authors: [{ name: "Charmila Computers", url: siteUrl }],
  creator: "Charmila Computers",
  publisher: "Charmila Computers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Charmila Computers",
    title: "Charmila Computers | Computer Sales, Service & Custom PC Builds",
    description:
      "India's premier computer hardware destination. Sales & service for PC components, graphics cards, processors, laptops and custom builds.",
    url: siteUrl,
    images: [{ url: "/images/festive/hero-main.png", width: 1200, height: 630, alt: "Charmila Computers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Charmila Computers | Computer Sales, Service & Custom PC Builds",
    description:
      "India's premier computer hardware destination for PC components, graphics cards, processors, repair services and custom builds.",
    images: ["/images/festive/hero-main.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export const viewport = {
  themeColor: "#7A1118",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "ComputerStore"],
      "@id": "https://charmilacomputers.in/#store",
      name: "Charmila Computers",
      alternateName: "Charmila Computers Sales & Services",
      url: "https://charmilacomputers.in",
      logo: "https://charmilacomputers.in/icon.png",
      image: "https://charmilacomputers.in/images/festive/hero-main.png",
      description:
        "Charmila Computers provides computer sales, repair, hardware upgrades, and custom PC builds in Andhra Pradesh, India. 100% genuine components with official manufacturer warranty.",
      telephone: "+919010177427",
      email: "info@charmilacomputers.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Andhra Pradesh, India",
        addressLocality: "Andhra Pradesh",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:30",
          closes: "19:30",
        },
      ],
      priceRange: "₹₹",
      paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking",
      currenciesAccepted: "INR",
      sameAs: [
        "https://www.facebook.com/charmilacomputers",
        "https://twitter.com/charmilacomputr",
        "https://www.instagram.com/charmilacomputers",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://charmilacomputers.in/#website",
      url: "https://charmilacomputers.in",
      name: "Charmila Computers",
      publisher: {
        "@id": "https://charmilacomputers.in/#store",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://charmilacomputers.in/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the theme on the server (Supabase = source of truth) and stamp it
  // onto <html> here. The correct theme is in the very first byte of HTML, so
  // there is no festive→standard flash on refresh. useStoreTheme is seeded from
  // the same value via ThemeProvider, so the first client render matches too.
  const initialTheme = await getServerTheme();

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${montserrat.variable} ${cinzel.variable} ${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('charmila_active_theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F3EA] text-[#1B1B1B]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider initialTheme={initialTheme}>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
            <Toast />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
