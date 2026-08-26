export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const STORE = {
  name: "Charmila Computers",
  tagline: "Sales & Service — Laptops, Desktops, CCTV, Printers & PC Spares",
  phonePrimary: "9010177427",
  phoneSecondary: "9391251826",
  whatsapp: "919010177427",
  email: "info@charmilacomputers.in",
  address: "Andhra Pradesh, India",
  gstin: "37DDUPG5482C1Z7",
  social: {
    facebook: "https://www.facebook.com/charmilacomputers",
    twitter: "https://twitter.com/charmilacomputr",
    instagram: "https://www.instagram.com/charmilacomputers",
  },
};

export function whatsappOrderLink(message: string): string {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
