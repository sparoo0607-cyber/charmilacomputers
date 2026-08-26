import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Charmila Computers | High-Performance PC Hardware & Custom Rigs",
    short_name: "Charmila Computers",
    description:
      "India's premier computer hardware destination — PC components, graphics cards, processors, laptops and custom builds.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#7A1118",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
