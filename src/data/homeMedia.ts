import { supabase } from "@/lib/supabase/client";
import { ThemeId, normalizeTheme } from "@/lib/theme";



export interface CategoryCardMedia {
  id: string;
  slug: string;
  name: string;
  desc: string;
  festiveAccent?: string;
  startPrice: string;
  image: string;
}

export interface PromoBannerMedia {
  id: string;
  image: string;
  alt?: string;
  link: string;
  badge?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
}

export interface FlagshipProductMedia {
  id: string;
  badge: string;
  brand: string;
  name: string;
  series: string;
  specs: string;
  price: number;
  mrp: number;
  discount?: number;
  image: string;
  link: string;
}

export interface HeroBannerItem {
  id: string;
  imageSrc: string;
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  button2Text?: string;
  button2Link?: string;
}

export interface HomePageMediaState {
  hero: {
    main: HeroBannerItem;
    gaming: HeroBannerItem;
    builder: HeroBannerItem;
  };
  promos: {
    buildDifferent: PromoBannerMedia;
    templeNight: PromoBannerMedia;
  };
  flagship: FlagshipProductMedia;
  components: CategoryCardMedia[];
  gaming: CategoryCardMedia[];
  accessories: CategoryCardMedia[];
}

export const VINAYAKA_THEME_MEDIA: HomePageMediaState = {
  hero: {
    main: {
      id: "main",
      imageSrc: "/themes/vinayaka/banner-33.png",
      badgeText: "VINAYAKA CHAVITHI SALE · UP TO 40% OFF",
      titleLine1: "ELEVATE YOUR",
      titleLine2: "SETUP TODAY",
      subtitle: "Next-gen processors, RTX 50 GPUs & custom liquid-cooled rigs at unbeatable festive prices.",
      buttonText: "Explore Offers",
      buttonLink: "/offers",
      button2Text: "Build Your PC",
      button2Link: "/build-your-pc",
    },
    gaming: {
      id: "gaming",
      imageSrc: "/themes/vinayaka/banner-32.png",
      badgeText: "GAMING FEST · UP TO 45% OFF",
      titleLine1: "PRO GAMING",
      titleLine2: "GEAR",
      subtitle: "Keyboards, mice & RGB headsets",
      buttonText: "Shop Gear",
      buttonLink: "/category/gaming",
    },
    builder: {
      id: "builder",
      imageSrc: "/themes/vinayaka/banner-31.png",
      badgeText: "PC BUILDER DEALS",
      titleLine1: "SAVE MORE",
      titleLine2: "BUILD MORE",
      subtitle: "Motherboards, RAM & Fast SSDs",
      buttonText: "Start Building",
      buttonLink: "/build-your-pc",
    },
  },
  promos: {
    buildDifferent: {
      id: "buildDifferent",
      image: "/themes/vinayaka/banner-30.png",
      alt: "Build Different - Festive, Powerful, Yours",
      link: "/build-your-pc",
    },
    templeNight: {
      id: "templeNight",
      image: "/themes/vinayaka/banner-16.png",
      alt: "Vinayaka Chavithi Mega Fest - Ignite Your Gaming Dreams",
      link: "/category/gaming",
      badge: "VINAYAKA CHAVITHI MEGA FEST",
      titleLine1: "IGNITE YOUR",
      titleLine2: "GAMING DREAMS",
      subtitle: "Unleash unmatched performance with Custom High-End Gaming Rigs, RTX 50-Series Graphics Cards & Liquid Cooled Beast Setups.",
      buttonText: "Shop Gaming Deals",
      buttonLink: "/category/gaming",
      button2Text: "Build Custom PC",
      button2Link: "/build-your-pc",
    },
  },
  flagship: {
    id: "flagshipGpu",
    badge: "FLAGSHIP BEAST",
    brand: "MSI",
    series: "MSI SUPRIM X SERIES",
    name: "MSI GeForce RTX 4090 SUPRIM X 24G",
    specs: "24GB GDDR6X • TRI FROZR 3S Cooling • DLSS 3.5 • Dual BIOS",
    price: 199999,
    mrp: 220000,
    discount: 9,
    image: "/images/graphics-cards.png",
    link: "/product/gpu-suprim",
  },
  components: [
    {
      id: "comp-processors",
      slug: "processors",
      name: "PROCESSORS",
      desc: "Power your next build",
      festiveAccent: "Flagship Performance",
      startPrice: "₹9,150",
      image: "/themes/vinayaka/banner-29.png",
    },
    {
      id: "comp-motherboards",
      slug: "motherboards",
      name: "MOTHERBOARDS",
      desc: "Solid foundation for performance",
      festiveAccent: "DDR5 & PCIe 5.0",
      startPrice: "₹6,600",
      image: "/themes/vinayaka/banner-26.png",
    },
    {
      id: "comp-custom-cooling",
      slug: "coolers",
      name: "CUSTOM COOLING",
      desc: "Peak thermal dissipation",
      festiveAccent: "ARGB & 360mm Radiators",
      startPrice: "₹6,499",
      image: "/themes/vinayaka/banner-25.png",
    },
    {
      id: "comp-cpu-coolers",
      slug: "coolers",
      name: "CPU COOLERS",
      desc: "Silent & efficient airflow",
      festiveAccent: "High Static Pressure",
      startPrice: "₹1,650",
      image: "/themes/vinayaka/banner-24.png",
    },
    {
      id: "comp-graphics-cards",
      slug: "graphics-cards",
      name: "GRAPHICS CARDS",
      desc: "Next-gen ray tracing & DLSS",
      festiveAccent: "RTX 50 & 40 Series",
      startPrice: "₹14,500",
      image: "/themes/vinayaka/banner-23.png",
    },
    {
      id: "comp-ram",
      slug: "memory",
      name: "RAM (MEMORY)",
      desc: "High-speed DDR4 & DDR5",
      festiveAccent: "Up to 6000MHz OC",
      startPrice: "₹1,950",
      image: "/themes/vinayaka/banner-22.png",
    },
    {
      id: "comp-ssd",
      slug: "ssd",
      name: "SSD STORAGE",
      desc: "Blazing fast NVMe speeds",
      festiveAccent: "Gen4 & Gen5 Speeds",
      startPrice: "₹1,650",
      image: "/themes/vinayaka/banner-21.png",
    },
    {
      id: "comp-monitors",
      slug: "monitors",
      name: "GAMING MONITORS",
      desc: "Ultra-fast refresh rates",
      festiveAccent: "180Hz+ Fast IPS",
      startPrice: "₹6,300",
      image: "/themes/vinayaka/banner-20.png",
    },
    {
      id: "comp-power-supply",
      slug: "power-supply",
      name: "POWER SUPPLIES",
      desc: "80 Plus Gold certified",
      festiveAccent: "ATX 3.0 Ready",
      startPrice: "₹2,450",
      image: "/themes/vinayaka/banner-19.png",
    },
    {
      id: "comp-cabinets",
      slug: "cabinets",
      name: "PC CABINETS",
      desc: "Optimized airflow & RGB",
      festiveAccent: "Panoramic Dual-Chamber",
      startPrice: "₹2,650",
      image: "/themes/vinayaka/banner-17.png",
    },
  ],
  gaming: [
    {
      id: "game-keyboards",
      slug: "keyboards",
      name: "GAMING KEYBOARDS",
      desc: "Mechanical switches & RGB",
      startPrice: "₹550",
      image: "/themes/vinayaka/banner-15.png",
    },
    {
      id: "game-mice",
      slug: "mice",
      name: "GAMING MICE",
      desc: "High-DPI precision optical sensors",
      startPrice: "₹350",
      image: "/themes/vinayaka/banner-14.png",
    },
    {
      id: "game-headsets",
      slug: "headsets",
      name: "GAMING HEADSETS",
      desc: "7.1 Surround & noise isolation",
      startPrice: "₹899",
      image: "/themes/vinayaka/banner-13.png",
    },
    {
      id: "game-mousepads",
      slug: "accessories",
      name: "RGB MOUSEPADS",
      desc: "Micro-woven smooth glide",
      startPrice: "₹399",
      image: "/themes/vinayaka/banner-12.png",
    },
    {
      id: "game-gamepads",
      slug: "accessories",
      name: "GAMEPADS",
      desc: "Wireless & tactile feedback",
      startPrice: "₹1,299",
      image: "/themes/vinayaka/banner-11.png",
    },
  ],
  accessories: [
    {
      id: "acc-printers",
      slug: "printers",
      name: "PRINTERS & INK",
      desc: "All-in-one wireless printing",
      startPrice: "₹6,999",
      image: "/themes/vinayaka/banner-10.png",
    },
    {
      id: "acc-laptop-coolers",
      slug: "accessories",
      name: "LAPTOP COOLERS",
      desc: "Multi-fan active cooling",
      startPrice: "₹850",
      image: "/themes/vinayaka/banner-9.png",
    },
    {
      id: "acc-pen-drives",
      slug: "ssd",
      name: "PEN DRIVES",
      desc: "High-speed portable USB",
      startPrice: "₹399",
      image: "/themes/vinayaka/banner-8.png",
    },
    {
      id: "acc-routers",
      slug: "networking",
      name: "WIFI ROUTERS",
      desc: "Dual-band WiFi 6 coverage",
      startPrice: "₹1,199",
      image: "/themes/vinayaka/banner-7.png",
    },
    {
      id: "acc-ups",
      slug: "power-supply",
      name: "UPS SYSTEMS",
      desc: "Uninterrupted power backup",
      startPrice: "₹2,899",
      image: "/themes/vinayaka/banner-6.png",
    },
    {
      id: "acc-webcams",
      slug: "cctv",
      name: "HD WEBCAMS",
      desc: "1080p stream & mic clarity",
      startPrice: "₹1,450",
      image: "/themes/vinayaka/banner-5.png",
    },
    {
      id: "acc-pen-tablets",
      slug: "accessories",
      name: "PEN TABLETS",
      desc: "Digital art & design stylus",
      startPrice: "₹3,200",
      image: "/themes/vinayaka/banner-4.png",
    },
    {
      id: "acc-speakers",
      slug: "accessories",
      name: "SPEAKER SYSTEMS",
      desc: "Immersive audio & bass",
      startPrice: "₹1,150",
      image: "/themes/vinayaka/banner-3.png",
    },
    {
      id: "acc-surge-protectors",
      slug: "accessories",
      name: "SURGE PROTECTORS",
      desc: "Multi-socket voltage defense",
      startPrice: "₹450",
      image: "/themes/vinayaka/banner-2.png",
    },
    {
      id: "acc-software",
      slug: "services",
      name: "SOFTWARE & OS",
      desc: "Genuine Windows & Antivirus",
      startPrice: "₹1,999",
      image: "/themes/vinayaka/banner-1.png",
    },
  ],
};

export const STANDARD_THEME_MEDIA: HomePageMediaState = {
  hero: {
    main: {
      id: "main",
      imageSrc: "/themes/standard/hero-banner-1.png",
      badgeText: "CHARMILA COMPUTERS · OFFICIAL BRAND WARRANTY",
      titleLine1: "PREMIUM CUSTOM",
      titleLine2: "WORKSTATIONS",
      subtitle: "Enterprise-grade PC builds with 100% genuine components and pan-India insured delivery.",
      buttonText: "Configure PC",
      buttonLink: "/build-your-pc",
      button2Text: "View Products",
      button2Link: "/category/processors",
    },
    gaming: {
      id: "gaming",
      imageSrc: "/themes/standard/hero-banner-2.png",
      badgeText: "HIGH-REFRESH DISPLAY FEST",
      titleLine1: "UNLEASH 240Hz",
      titleLine2: "PERFORMANCE",
      subtitle: "Top rated IPS & OLED gaming monitors",
      buttonText: "Shop Monitors",
      buttonLink: "/category/monitors",
    },
    builder: {
      id: "builder",
      imageSrc: "/themes/standard/hero-banner-3.png",
      badgeText: "NEXT-GEN HARDWARE DEALS",
      titleLine1: "RTX 50 SERIES",
      titleLine2: "READY",
      subtitle: "High wattage power supplies & PCIe 5.0 motherboards",
      buttonText: "Shop Hardware",
      buttonLink: "/category/graphics-cards",
    },
  },
  promos: {
    buildDifferent: {
      id: "buildDifferent",
      image: "/themes/standard/promo-build-different.png",
      alt: "Precision Engineering - Custom Rig Configurator",
      link: "/build-your-pc",
    },
    templeNight: {
      id: "templeNight",
      image: "/themes/standard/promo-workstations.png",
      alt: "Ultra Performance Workstations - Enterprise Hardware Special",
      link: "/category/processors",
      badge: "ENTERPRISE HARDWARE SPECIAL",
      titleLine1: "ULTRA PERFORMANCE",
      titleLine2: "WORKSTATIONS",
      subtitle: "Tested and validated under extreme workloads with official manufacturer direct warranty support.",
      buttonText: "Browse Hardware",
      buttonLink: "/category/processors",
      button2Text: "Build Workstation",
      button2Link: "/build-your-pc",
    },
  },
  flagship: {
    id: "flagshipGpu",
    badge: "FLAGSHIP WORKSTATION GPU",
    brand: "MSI",
    series: "MSI SUPRIM X SERIES",
    name: "MSI GeForce RTX 4090 SUPRIM X 24G",
    specs: "24GB GDDR6X • Extreme Stability • Official 3-Year Warranty",
    price: 199999,
    mrp: 220000,
    discount: 9,
    image: "/themes/standard/GRAPHICS CARDS.png",
    link: "/product/gpu-suprim",
  },
  components: [
    {
      id: "comp-processors",
      slug: "processors",
      name: "PROCESSORS",
      desc: "Power your next build",
      festiveAccent: "Official Warranty",
      startPrice: "₹9,150",
      image: "/themes/standard/PROCESSORS.png",
    },
    {
      id: "comp-motherboards",
      slug: "motherboards",
      name: "MOTHERBOARDS",
      desc: "Solid foundation for performance",
      festiveAccent: "DDR5 & PCIe 5.0",
      startPrice: "₹6,600",
      image: "/themes/standard/MOTHERBOARDS.png",
    },
    {
      id: "comp-custom-cooling",
      slug: "coolers",
      name: "CUSTOM COOLING",
      desc: "Peak thermal dissipation",
      festiveAccent: "Extreme Radiators",
      startPrice: "₹6,499",
      image: "/themes/standard/CUSTOM COOLING.png",
    },
    {
      id: "comp-cpu-coolers",
      slug: "coolers",
      name: "CPU COOLERS",
      desc: "Silent & efficient airflow",
      festiveAccent: "High Static Pressure",
      startPrice: "₹1,650",
      image: "/themes/standard/CPU COOLERS.png",
    },
    {
      id: "comp-graphics-cards",
      slug: "graphics-cards",
      name: "GRAPHICS CARDS",
      desc: "Next-gen ray tracing & DLSS",
      festiveAccent: "RTX 50 & 40 Series",
      startPrice: "₹14,500",
      image: "/themes/standard/GRAPHICS CARDS.png",
    },
    {
      id: "comp-ram",
      slug: "memory",
      name: "RAM (MEMORY)",
      desc: "High-speed DDR4 & DDR5",
      festiveAccent: "Up to 6000MHz OC",
      startPrice: "₹1,950",
      image: "/themes/standard/RAM (MEMORY).png",
    },
    {
      id: "comp-ssd",
      slug: "ssd",
      name: "SSD STORAGE",
      desc: "Blazing fast NVMe speeds",
      festiveAccent: "Gen4 & Gen5 Speeds",
      startPrice: "₹1,650",
      image: "/themes/standard/ssd's.png",
    },
    {
      id: "comp-monitors",
      slug: "monitors",
      name: "GAMING MONITORS",
      desc: "Ultra-fast refresh rates",
      festiveAccent: "180Hz+ Fast IPS",
      startPrice: "₹6,300",
      image: "/themes/standard/gaming monitors.png",
    },
    {
      id: "comp-power-supply",
      slug: "power-supply",
      name: "POWER SUPPLIES",
      desc: "80 Plus Gold certified",
      festiveAccent: "ATX 3.0 Ready",
      startPrice: "₹2,450",
      image: "/themes/standard/ups.png",
    },
    {
      id: "comp-cabinets",
      slug: "cabinets",
      name: "PC CABINETS",
      desc: "Optimized airflow & RGB",
      festiveAccent: "High Airflow Design",
      startPrice: "₹2,650",
      image: "/themes/standard/cat-cabinets.png",
    },
  ],

  gaming: [
    {
      id: "game-keyboards",
      slug: "keyboards",
      name: "GAMING KEYBOARDS",
      desc: "Mechanical switches & RGB",
      startPrice: "₹550",
      image: "/themes/standard/Gaming Keyboards.png",
    },
    {
      id: "game-mice",
      slug: "mice",
      name: "GAMING MICE",
      desc: "High-DPI precision optical sensors",
      startPrice: "₹350",
      image: "/themes/standard/Gaming mice.png",
    },
    {
      id: "game-headsets",
      slug: "headsets",
      name: "GAMING HEADSETS",
      desc: "7.1 Surround & noise isolation",
      startPrice: "₹899",
      image: "/themes/standard/gaming headsets.png",
    },
    {
      id: "game-mousepads",
      slug: "accessories",
      name: "RGB MOUSEPADS",
      desc: "Micro-woven smooth glide",
      startPrice: "₹399",
      image: "/themes/standard/rgb mousepads.png",
    },
    {
      id: "game-gamepads",
      slug: "accessories",
      name: "GAMEPADS",
      desc: "Wireless & tactile feedback",
      startPrice: "₹1,299",
      image: "/themes/standard/gamepads.png",
    },
  ],
  accessories: [
    {
      id: "acc-printers",
      slug: "printers",
      name: "PRINTERS & INK",
      desc: "All-in-one wireless printing",
      startPrice: "₹6,999",
      image: "/themes/standard/printers.png",
    },
    {
      id: "acc-laptop-coolers",
      slug: "accessories",
      name: "LAPTOP COOLERS",
      desc: "Multi-fan active cooling",
      startPrice: "₹850",
      image: "/themes/standard/Laptop coolers.png",
    },
    {
      id: "acc-pen-drives",
      slug: "ssd",
      name: "PEN DRIVES",
      desc: "High-speed portable USB",
      startPrice: "₹399",
      image: "/themes/standard/pen drives.png",
    },
    {
      id: "acc-routers",
      slug: "networking",
      name: "WIFI ROUTERS",
      desc: "Dual-band WiFi 6 coverage",
      startPrice: "₹1,199",
      image: "/themes/standard/Router.png",
    },
    {
      id: "acc-ups",
      slug: "power-supply",
      name: "UPS SYSTEMS",
      desc: "Uninterrupted power backup",
      startPrice: "₹2,899",
      image: "/themes/standard/ups systems.png",
    },
    {
      id: "acc-webcams",
      slug: "cctv",
      name: "HD WEBCAMS",
      desc: "1080p stream & mic clarity",
      startPrice: "₹1,450",
      image: "/themes/standard/web cams.png",
    },
    {
      id: "acc-pen-tablets",
      slug: "accessories",
      name: "PEN TABLETS",
      desc: "Digital art & design stylus",
      startPrice: "₹3,200",
      image: "/themes/standard/pen tablets.png",
    },
    {
      id: "acc-speakers",
      slug: "accessories",
      name: "SPEAKER SYSTEMS",
      desc: "Immersive audio & bass",
      startPrice: "₹1,150",
      image: "/themes/standard/speakers.png",
    },
    {
      id: "acc-surge-protectors",
      slug: "accessories",
      name: "SURGE PROTECTORS",
      desc: "Multi-socket voltage defense",
      startPrice: "₹450",
      image: "/themes/standard/surge protector.jpeg",
    },
    {
      id: "acc-software",
      slug: "services",
      name: "SOFTWARE & OS",
      desc: "Genuine Windows & Antivirus",
      startPrice: "₹1,999",
      image: "/themes/standard/intel box.png",
    },
  ],
};

export const DEFAULT_HOME_MEDIA: HomePageMediaState = STANDARD_THEME_MEDIA;

export const STORE_IMAGE_PRESETS = [
  { label: "Vinayaka Main Hero Banner", value: "/themes/vinayaka/banner-33.png", category: "Vinayaka Theme" },
  { label: "Vinayaka Gaming Fest", value: "/themes/vinayaka/banner-32.png", category: "Vinayaka Theme" },
  { label: "Vinayaka PC Builder", value: "/themes/vinayaka/banner-31.png", category: "Vinayaka Theme" },
  { label: "Vinayaka Build Different Wide", value: "/themes/vinayaka/banner-30.png", category: "Vinayaka Theme" },
  { label: "Vinayaka Temple Night Panorama", value: "/themes/vinayaka/banner-16.png", category: "Vinayaka Theme" },
  { label: "Standard Hero Banner 1", value: "/themes/standard/hero-banner-1.png", category: "Standard Theme" },
  { label: "Standard Hero Banner 2", value: "/themes/standard/hero-banner-2.png", category: "Standard Theme" },
  { label: "Standard Hero Banner 3", value: "/themes/standard/hero-banner-3.png", category: "Standard Theme" },
  { label: "Standard Build Different Wide", value: "/themes/standard/promo-build-different.png", category: "Standard Theme" },
  { label: "Standard Workstation Panorama", value: "/themes/standard/promo-workstations.png", category: "Standard Theme" },
  { label: "Standard Processors", value: "/themes/standard/PROCESSORS.png", category: "Standard Theme" },
  { label: "Standard Motherboards", value: "/themes/standard/MOTHERBOARDS.png", category: "Standard Theme" },
  { label: "Standard Graphics Cards", value: "/themes/standard/GRAPHICS CARDS.png", category: "Standard Theme" },
  { label: "Standard RAM Memory", value: "/themes/standard/RAM (MEMORY).png", category: "Standard Theme" },
  { label: "Standard SSD Storage", value: "/themes/standard/ssd's.png", category: "Standard Theme" },
  { label: "Standard Gaming Monitors", value: "/themes/standard/gaming monitors.png", category: "Standard Theme" },
  { label: "Standard Gaming Keyboards", value: "/themes/standard/Gaming Keyboards.png", category: "Standard Theme" },
  { label: "Standard Gaming Mice", value: "/themes/standard/Gaming mice.png", category: "Standard Theme" },
  { label: "Standard Gaming Headsets", value: "/themes/standard/gaming headsets.png", category: "Standard Theme" },
  { label: "Standard RGB Mousepads", value: "/themes/standard/rgb mousepads.png", category: "Standard Theme" },
  { label: "Standard Gamepads", value: "/themes/standard/gamepads.png", category: "Standard Theme" },
  { label: "Standard Printers", value: "/themes/standard/printers.png", category: "Standard Theme" },
  { label: "Standard Laptop Coolers", value: "/themes/standard/Laptop coolers.png", category: "Standard Theme" },
  { label: "Standard Pen Drives", value: "/themes/standard/pen drives.png", category: "Standard Theme" },
  { label: "Standard WiFi Routers", value: "/themes/standard/Router.png", category: "Standard Theme" },
  { label: "Standard UPS Systems", value: "/themes/standard/ups systems.png", category: "Standard Theme" },
  { label: "Standard Webcams", value: "/themes/standard/web cams.png", category: "Standard Theme" },
  { label: "Standard Pen Tablets", value: "/themes/standard/pen tablets.png", category: "Standard Theme" },
  { label: "Standard Speaker Systems", value: "/themes/standard/speakers.png", category: "Standard Theme" },
  { label: "Standard Surge Protectors", value: "/themes/standard/surge protector.jpeg", category: "Standard Theme" },
  { label: "Graphics Cards Showcase", value: "/images/graphics-cards.png", category: "Showcase" },
  { label: "Laptops Showcase", value: "/images/laptops.png", category: "Showcase" },
  { label: "Desktops Showcase", value: "/images/desktops.png", category: "Showcase" },
];

export const DUSSARA_COMPONENTS_MEDIA: CategoryCardMedia[] = [
  {
    id: "comp-processors",
    slug: "processors",
    name: "PROCESSORS",
    desc: "Power your next build",
    festiveAccent: "Dussara Festival Offer",
    startPrice: "₹9,150",
    image: "/themes/dussara/Products/1.png",
  },
  {
    id: "comp-motherboards",
    slug: "motherboards",
    name: "MOTHERBOARDS",
    desc: "Solid foundation for performance",
    festiveAccent: "DDR5 & PCIe 5.0",
    startPrice: "₹6,600",
    image: "/themes/dussara/Products/2.png",
  },
  {
    id: "comp-custom-cooling",
    slug: "coolers",
    name: "CUSTOM COOLING",
    desc: "Peak thermal dissipation",
    festiveAccent: "ARGB & 360mm Radiators",
    startPrice: "₹6,499",
    image: "/themes/dussara/Products/3.png",
  },
  {
    id: "comp-cpu-coolers",
    slug: "coolers",
    name: "CPU COOLERS",
    desc: "Silent & efficient airflow",
    festiveAccent: "High Static Pressure",
    startPrice: "₹1,650",
    image: "/themes/dussara/Products/4.png",
  },
  {
    id: "comp-graphics-cards",
    slug: "graphics-cards",
    name: "GRAPHICS CARDS",
    desc: "Next-gen ray tracing & DLSS",
    festiveAccent: "RTX 50 & 40 Series",
    startPrice: "₹14,500",
    image: "/themes/dussara/Products/5.png",
  },
  {
    id: "comp-ram",
    slug: "memory",
    name: "RAM (MEMORY)",
    desc: "High-speed DDR4 & DDR5",
    festiveAccent: "Up to 6000MHz OC",
    startPrice: "₹1,950",
    image: "/themes/dussara/Products/6.png",
  },
  {
    id: "comp-ssd",
    slug: "ssd",
    name: "SSD STORAGE",
    desc: "Blazing fast NVMe speeds",
    festiveAccent: "Gen4 & Gen5 Speeds",
    startPrice: "₹1,650",
    image: "/themes/dussara/Products/7.png",
  },
  {
    id: "comp-monitors",
    slug: "monitors",
    name: "GAMING MONITORS",
    desc: "Ultra-fast refresh rates",
    festiveAccent: "180Hz+ Fast IPS",
    startPrice: "₹6,300",
    image: "/themes/dussara/Products/8.png",
  },
  {
    id: "comp-power-supply",
    slug: "power-supply",
    name: "POWER SUPPLIES",
    desc: "80 Plus Gold certified",
    festiveAccent: "ATX 3.0 Ready",
    startPrice: "₹2,450",
    image: "/themes/dussara/Products/9.png",
  },
  {
    id: "comp-cabinets",
    slug: "cabinets",
    name: "PC CABINETS",
    desc: "Optimized airflow & RGB",
    festiveAccent: "Panoramic Dual-Chamber",
    startPrice: "₹2,650",
    image: "/themes/dussara/Products/10.png",
  },
];

export const DUSSARA_GAMING_MEDIA: CategoryCardMedia[] = [
  {
    id: "game-keyboards",
    slug: "keyboards",
    name: "GAMING KEYBOARDS",
    desc: "Mechanical switches & RGB",
    startPrice: "₹550",
    image: "/themes/dussara/Products/11.png",
  },
  {
    id: "game-mice",
    slug: "mice",
    name: "GAMING MICE",
    desc: "High-DPI precision optical sensors",
    startPrice: "₹350",
    image: "/themes/dussara/Products/12.png",
  },
  {
    id: "game-headsets",
    slug: "headsets",
    name: "GAMING HEADSETS",
    desc: "7.1 Surround & noise isolation",
    startPrice: "₹899",
    image: "/themes/dussara/Products/13.png",
  },
  {
    id: "game-mousepads",
    slug: "accessories",
    name: "RGB MOUSEPADS",
    desc: "Micro-woven smooth glide",
    startPrice: "₹399",
    image: "/themes/dussara/Products/14.png",
  },
  {
    id: "game-gamepads",
    slug: "accessories",
    name: "GAMEPADS",
    desc: "Wireless & tactile feedback",
    startPrice: "₹1,299",
    image: "/themes/dussara/Products/15.png",
  },
];

export const DUSSARA_ACCESSORIES_MEDIA: CategoryCardMedia[] = [
  {
    id: "acc-printers",
    slug: "printers",
    name: "PRINTERS & INK",
    desc: "All-in-one wireless printing",
    startPrice: "₹6,999",
    image: "/themes/dussara/Products/16.png",
  },
  {
    id: "acc-laptop-coolers",
    slug: "accessories",
    name: "LAPTOP COOLERS",
    desc: "Multi-fan active cooling",
    startPrice: "₹850",
    image: "/themes/dussara/Products/17.png",
  },
  {
    id: "acc-pen-drives",
    slug: "ssd",
    name: "PEN DRIVES",
    desc: "High-speed portable USB",
    startPrice: "₹399",
    image: "/themes/dussara/Products/19.png",
  },
  {
    id: "acc-routers",
    slug: "networking",
    name: "WIFI ROUTERS",
    desc: "Dual-band WiFi 6 coverage",
    startPrice: "₹1,199",
    image: "/themes/dussara/Products/18.png",
  },
  {
    id: "acc-ups",
    slug: "power-supply",
    name: "UPS SYSTEMS",
    desc: "Uninterrupted power backup",
    startPrice: "₹2,899",
    image: "/themes/dussara/Products/20.png",
  },
  {
    id: "acc-webcams",
    slug: "cctv",
    name: "HD WEBCAMS",
    desc: "1080p stream & mic clarity",
    startPrice: "₹1,450",
    image: "/themes/dussara/Products/21.png",
  },
  {
    id: "acc-pen-tablets",
    slug: "accessories",
    name: "PEN TABLETS",
    desc: "Digital art & design stylus",
    startPrice: "₹3,200",
    image: "/themes/dussara/Products/22.png",
  },
  {
    id: "acc-speakers",
    slug: "accessories",
    name: "SPEAKER SYSTEMS",
    desc: "Immersive audio & bass",
    startPrice: "₹1,150",
    image: "/themes/dussara/Products/23.png",
  },
  {
    id: "acc-surge-protectors",
    slug: "accessories",
    name: "SURGE PROTECTORS",
    desc: "Multi-socket voltage defense",
    startPrice: "₹450",
    image: "/themes/dussara/Products/24.png",
  },
  {
    id: "acc-software",
    slug: "services",
    name: "SOFTWARE & OS",
    desc: "Genuine Windows & Antivirus",
    startPrice: "₹1,999",
    image: "/themes/dussara/Products/25.png",
  },
];

export function getDussaraThemeMedia(dayNum: number): HomePageMediaState {
  const folder = `/themes/dussara/D${dayNum}`;
  const base = VINAYAKA_THEME_MEDIA;
  const dussaraTitles: { [key: number]: { badge: string; goddess: string } } = {
    1: { badge: "SHAILAPUTRI DEVI · DUSSARA DAY 1", goddess: "Swarna Kavachalankruta Durga" },
    2: { badge: "BRAHMACHARINI DEVI · DUSSARA DAY 2", goddess: "Sri Bala Tripura Sundari" },
    3: { badge: "CHANDRAGHANTA DEVI · DUSSARA DAY 3", goddess: "Sri Gayatri Devi" },
    4: { badge: "KUSHMANDA DEVI · DUSSARA DAY 4", goddess: "Sri Annapurna Devi" },
    5: { badge: "SKANDAMATA DEVI · DUSSARA DAY 5", goddess: "Sri Lakshmi Devi" },
    6: { badge: "KATYAYANI DEVI · DUSSARA DAY 6", goddess: "Sri Saraswati Devi" },
    7: { badge: "KALARATRI DEVI · DUSSARA DAY 7", goddess: "Sri Lalitha Tripura Sundari" },
    8: { badge: "MAHAGAURI DEVI · DUSSARA DAY 8", goddess: "Sri Mahishasura Mardhini" },
    9: { badge: "SIDDHIDATRI DEVI · DUSSARA DAY 9", goddess: "Sri Raja Rajeshwari Devi (Vijaya Dasami)" },
  };

  const meta = dussaraTitles[dayNum] || { badge: `DUSSARA DAY ${dayNum} SPECIAL`, goddess: "Sri Durga Devi" };

  return {
    ...base,
    hero: {
      main: {
        ...base.hero.main,
        imageSrc: `${folder}/1.png`,
        badgeText: `DUSSARA NAVRATRI DAY ${dayNum} · UP TO 45% OFF`,
        titleLine1: "DUSSEHRA FESTIVAL",
        titleLine2: "MEGA SALE",
        subtitle: `Navratri Day ${dayNum} (${meta.goddess}) — Special offers on RTX 50 series GPUs, liquid cooled rigs & high-speed SSDs.`,
      },
      gaming: {
        ...base.hero.gaming,
        imageSrc: `${folder}/2.png`,
        badgeText: `DUSSARA DAY ${dayNum} GAMING FEST`,
      },
      builder: {
        ...base.hero.builder,
        imageSrc: `${folder}/3.png`,
        badgeText: `DAY ${dayNum} PC BUILDER SPECIAL`,
      },
    },
    promos: {
      buildDifferent: {
        ...base.promos.buildDifferent,
        image: `${folder}/4.png`,
        alt: `Dussara Day ${dayNum} - Build Different Custom Rigs`,
      },
      templeNight: {
        ...base.promos.templeNight,
        image: `${folder}/5.png`,
        badge: meta.badge,
        alt: `${meta.badge} - Dussara Navratri Special`,
        titleLine1: "NAVRATRI FESTIVAL",
        titleLine2: "GAMING RIGS",
        subtitle: `Unleash extreme gaming performance with custom liquid-cooled PC rigs and high-end components this Dussara.`,
      },
    },
    components: DUSSARA_COMPONENTS_MEDIA,
    gaming: DUSSARA_GAMING_MEDIA,
    accessories: DUSSARA_ACCESSORIES_MEDIA,
  };
}

export const HOME_MEDIA_STORAGE_KEY = "charmila_home_media_v5";

/**
 * Returns complete media state for a given theme
 */
export function getThemeMedia(themeId: ThemeId): HomePageMediaState {
  if (themeId === "standard") return STANDARD_THEME_MEDIA;
  if (themeId === "festive") return VINAYAKA_THEME_MEDIA;
  if (typeof themeId === "string" && themeId.startsWith("dussara-d")) {
    const day = parseInt(themeId.replace("dussara-d", ""), 10) || 1;
    return getDussaraThemeMedia(day);
  }
  return VINAYAKA_THEME_MEDIA;
}

/**
 * Applies a theme across all homepage images, banners, and categories, saving to Server API, Supabase & localStorage
 */
export async function applyThemeMedia(themeId: ThemeId): Promise<HomePageMediaState> {
  const themeMedia = getThemeMedia(themeId);

  // 1. Notify global server API
  try {
    await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: themeId }),
    });
  } catch (e) {
    console.warn("Failed to notify /api/theme:", e);
  }

  // 2. Persist media and Supabase
  await saveHomeMedia(themeMedia, themeId);
  return themeMedia;
}

/**
 * Loads homepage media from Server API, Supabase & localStorage for all users
 */
export async function loadHomeMedia(themeOverride?: ThemeId): Promise<HomePageMediaState> {
  let resolvedTheme: ThemeId = themeOverride || "standard";

  // 1. If no override provided, query localStorage admin settings & server /api/theme
  if (!themeOverride) {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("charmila_admin_settings_v1");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.activeTheme) resolvedTheme = normalizeTheme(parsed.activeTheme);
        }
      } catch {}
    }
    try {
      const res = await fetch("/api/theme", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.activeTheme) {
          resolvedTheme = normalizeTheme(json.activeTheme);
        }
      }
    } catch {}
  }

  // 2. Fresh base state from the resolved theme
  const baseThemeMedia = getThemeMedia(resolvedTheme);
  let loadedState: HomePageMediaState = { ...baseThemeMedia };

  // 3. Try loading theme-specific cache from localStorage with cross-theme sanitization
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`${HOME_MEDIA_STORAGE_KEY}_${resolvedTheme}`);
      if (saved) {
        const parsed = JSON.parse(saved);

        // Helper to sanitize cross-theme contamination
        const isClean = (url?: string) => {
          if (!url) return false;
          if (resolvedTheme === "standard") {
            return !url.includes("/themes/vinayaka/") && !url.includes("/images/festive/") && !url.includes("/themes/dussara/");
          }
          if (resolvedTheme.startsWith("dussara-d")) {
            const dayNum = resolvedTheme.replace("dussara-d", "");
            if (url.includes("/themes/vinayaka/") || url.includes("/themes/standard/")) return false;
            if (url.includes("/themes/dussara/D") && !url.includes(`/themes/dussara/D${dayNum}/`)) return false;
            return true;
          }
          if (resolvedTheme === "festive") {
            return !url.includes("/themes/standard/") && !url.includes("/themes/dussara/");
          }
          return true;
        };

        loadedState = {
          ...loadedState,
          hero: {
            main: isClean(parsed.hero?.main?.imageSrc) ? { ...loadedState.hero.main, ...parsed.hero.main } : loadedState.hero.main,
            gaming: isClean(parsed.hero?.gaming?.imageSrc) ? { ...loadedState.hero.gaming, ...parsed.hero.gaming } : loadedState.hero.gaming,
            builder: isClean(parsed.hero?.builder?.imageSrc) ? { ...loadedState.hero.builder, ...parsed.hero.builder } : loadedState.hero.builder,
          },
          promos: {
            buildDifferent: isClean(parsed.promos?.buildDifferent?.image) ? { ...loadedState.promos.buildDifferent, ...parsed.promos.buildDifferent } : loadedState.promos.buildDifferent,
            templeNight: isClean(parsed.promos?.templeNight?.image) ? { ...loadedState.promos.templeNight, ...parsed.promos.templeNight } : loadedState.promos.templeNight,
          },
          flagship: isClean(parsed.flagship?.image) ? { ...loadedState.flagship, ...parsed.flagship } : loadedState.flagship,
          components: Array.isArray(parsed.components) && parsed.components.every((c: { image?: string }) => isClean(c.image))
            ? parsed.components
            : loadedState.components,
          gaming: Array.isArray(parsed.gaming) && parsed.gaming.every((c: { image?: string }) => isClean(c.image))
            ? parsed.gaming
            : loadedState.gaming,
          accessories: Array.isArray(parsed.accessories) && parsed.accessories.every((c: { image?: string }) => isClean(c.image))
            ? parsed.accessories
            : loadedState.accessories,
        };
      }
    } catch (e) {
      console.warn("Failed to parse local home media cache:", e);
    }
  }

  return loadedState;
}



/**
 * Saves homepage media to Supabase & localStorage and emits a live sync event
 */
export async function saveHomeMedia(media: HomePageMediaState, themeId?: ThemeId): Promise<void> {
  let currentTheme: ThemeId = themeId || "standard";

  if (!themeId && typeof window !== "undefined") {
    try {
      const savedSettings = localStorage.getItem("charmila_admin_settings_v1");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.activeTheme) currentTheme = normalizeTheme(parsed.activeTheme);
      }
    } catch {}
  }

  // 1. Post to global server API endpoint
  try {
    await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: currentTheme, media }),
    });
  } catch (e) {
    console.warn("Failed to notify /api/theme:", e);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("charmila_active_theme", currentTheme);
    localStorage.setItem(HOME_MEDIA_STORAGE_KEY, JSON.stringify(media));
    localStorage.setItem(`${HOME_MEDIA_STORAGE_KEY}_${currentTheme}`, JSON.stringify(media));
    localStorage.setItem("charmila_home_banners_v1", JSON.stringify(media.hero));
    
    // Also sync admin settings
    try {
      const existingSettings = localStorage.getItem("charmila_admin_settings_v1");
      const parsedSettings = existingSettings ? JSON.parse(existingSettings) : {};
      localStorage.setItem("charmila_admin_settings_v1", JSON.stringify({ ...parsedSettings, activeTheme: currentTheme }));
    } catch {}

    window.dispatchEvent(new Event("charmila_banners_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  try {
    // 1. Sync hero banners to Supabase

    for (const [id, item] of Object.entries(media.hero)) {
      await supabase.from("banners").upsert({
        id,
        image_src: item.imageSrc,
        badge_text: item.badgeText,
        title_line1: item.titleLine1,
        title_line2: item.titleLine2,
        subtitle: item.subtitle,
        button_text: item.buttonText,
        button_link: item.buttonLink,
        button2_text: item.button2Text || null,
        button2_link: item.button2Link || null,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Sync promo banners to Supabase
    if (media.promos.buildDifferent) {
      await supabase.from("banners").upsert({
        id: "buildDifferent",
        image_src: media.promos.buildDifferent.image,
        subtitle: media.promos.buildDifferent.alt || null,
        button_link: media.promos.buildDifferent.link,
        updated_at: new Date().toISOString(),
      });
    }

    if (media.promos.templeNight) {
      const tn = media.promos.templeNight;
      await supabase.from("banners").upsert({
        id: "templeNight",
        image_src: tn.image,
        badge_text: tn.badge || null,
        title_line1: tn.titleLine1 || null,
        title_line2: tn.titleLine2 || null,
        subtitle: tn.subtitle || null,
        button_text: tn.buttonText || null,
        button_link: tn.buttonLink || null,
        button2_text: tn.button2Text || null,
        button2_link: tn.button2Link || null,
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Sync flagship beast to Supabase
    if (media.flagship) {
      const fl = media.flagship;
      await supabase.from("banners").upsert({
        id: "flagshipGpu",
        image_src: fl.image,
        badge_text: fl.badge,
        title_line1: fl.name,
        title_line2: fl.series,
        subtitle: fl.specs,
        button_text: `₹${fl.price.toLocaleString()}`,
        button_link: fl.link,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Background Supabase banner sync error:", e);
  }
}

/**


 * Resets all home page media to default festive assets
 */
export function resetHomeMedia(): HomePageMediaState {
  if (typeof window !== "undefined") {
    localStorage.removeItem(HOME_MEDIA_STORAGE_KEY);
    localStorage.removeItem("charmila_home_banners_v1");
    window.dispatchEvent(new Event("charmila_banners_updated"));
    window.dispatchEvent(new Event("storage"));
  }
  return DEFAULT_HOME_MEDIA;
}


/**
 * Helper to read a local file and convert it into a base64 Data URL for instant live preview & storage
 */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to Data URL"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
