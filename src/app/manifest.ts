import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Charmila Computers | Computer Sales & Services",
    short_name: "Charmila Computers",
    description:
      "Charmila Computers provides computer sales, repair, hardware upgrades, and custom PC builds in Andhra Pradesh, India.",
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
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
