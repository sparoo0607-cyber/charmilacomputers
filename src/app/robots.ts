import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://charmilacomputers.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/cart",
          "/checkout",
          "/account",
          "/login",
          "/register",
          "/wishlist",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/cart",
          "/checkout",
          "/account",
          "/login",
          "/register",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
