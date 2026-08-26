import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat, Cinzel, Inter, Outfit } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import Toast from "@/components/Toast";
import { CartProvider } from "@/context/CartContext";

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


const siteUrl = "https://www.charmilacomputers.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Charmila Computers | High-Performance PC Hardware & Custom Rigs",
    template: "%s | Charmila Computers",
  },
  description:
    "Charmila Computers — India's premier computer hardware destination. Sales & service for PC components, graphics cards, processors, laptops and custom builds.",
  keywords: [
    "PC components India",
    "graphics cards",
    "custom PC builder",
    "gaming PC",
    "processors",
    "motherboards",
    "Charmila Computers",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Charmila Computers",
    title: "Charmila Computers | High-Performance PC Hardware & Custom Rigs",
    description:
      "India's premier computer hardware destination. Sales & service for PC components, graphics cards, processors, laptops and custom builds.",
    url: siteUrl,
    images: [{ url: "/images/festive/hero-main.png", width: 1200, height: 630, alt: "Charmila Computers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Charmila Computers | High-Performance PC Hardware & Custom Rigs",
    description:
      "India's premier computer hardware destination for PC components, graphics cards, processors and custom builds.",
    images: ["/images/festive/hero-main.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#7A1118",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${montserrat.variable} ${cinzel.variable} ${inter.variable} ${outfit.variable} h-full antialiased`}>

      <body className="min-h-full flex flex-col bg-[#F7F3EA] text-[#1B1B1B]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
