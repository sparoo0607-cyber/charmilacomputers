import { Category } from "./types";

export const categories: Category[] = [
  { slug: "processors", name: "Processors (CPU)", shortName: "CPU", group: "component", buildable: true, blurb: "Intel & AMD desktop processors" },
  { slug: "motherboards", name: "Motherboards", shortName: "Motherboard", group: "component", buildable: true, blurb: "Chipset boards for every socket" },
  { slug: "memory", name: "Memory (RAM)", shortName: "RAM", group: "component", buildable: true, blurb: "DDR4 & DDR5 desktop memory kits" },
  { slug: "ssd", name: "Solid State Drives", shortName: "SSD", group: "component", buildable: true, blurb: "NVMe M.2 & SATA SSDs" },
  { slug: "hdd", name: "Hard Disk Drives", shortName: "HDD", group: "component", buildable: true, blurb: "Internal storage HDDs" },
  { slug: "graphics-cards", name: "Graphics Cards", shortName: "GPU", group: "component", buildable: true, blurb: "NVIDIA & AMD gaming GPUs" },
  { slug: "power-supply", name: "Power Supply (SMPS)", shortName: "PSU", group: "component", buildable: true, blurb: "80+ certified power supplies" },
  { slug: "cabinets", name: "Cabinets", shortName: "Cabinet", group: "component", buildable: true, blurb: "ATX / mATX gaming cases" },
  { slug: "coolers", name: "CPU Coolers", shortName: "Cooler", group: "component", buildable: true, blurb: "Air & liquid CPU cooling" },
  { slug: "monitors", name: "Monitors", shortName: "Monitor", group: "peripheral", buildable: true, blurb: "IPS, VA & gaming displays" },
  { slug: "keyboards", name: "Keyboards", shortName: "Keyboard", group: "peripheral", buildable: true, blurb: "Mechanical & membrane keyboards" },
  { slug: "mice", name: "Mouse", shortName: "Mouse", group: "peripheral", buildable: true, blurb: "Gaming & office mice" },
  { slug: "headsets", name: "Headsets", shortName: "Headset", group: "peripheral", buildable: true, blurb: "Gaming & calling headsets" },
  { slug: "laptops", name: "Laptops", shortName: "Laptops", group: "device", buildable: false, blurb: "Dell, HP, Asus, Lenovo, Acer, MSI" },
  { slug: "desktops", name: "Prebuilt Desktops", shortName: "Desktops", group: "device", buildable: false, blurb: "Ready to use branded desktops" },
  { slug: "printers", name: "Printers", shortName: "Printers", group: "device", buildable: false, blurb: "Canon, Epson, Brother printers" },
  { slug: "cctv", name: "CCTV & Security", shortName: "CCTV", group: "device", buildable: false, blurb: "CP Plus, Hikvision, Dahua cameras" },
  { slug: "networking", name: "Networking", shortName: "Networking", group: "device", buildable: false, blurb: "Routers, switches, cable hubs by TP-Link, D-Link" },
  { slug: "services", name: "Sales & Service", shortName: "Service", group: "service", buildable: false, blurb: "Assembling, repair & AMC" },
];

export const buildableCategories = categories.filter((c) => c.buildable);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
