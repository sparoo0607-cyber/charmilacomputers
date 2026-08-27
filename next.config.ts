import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/banner images uploaded from the admin panel are served from the
    // Supabase Storage public bucket, e.g.
    //   https://<project-ref>.supabase.co/storage/v1/object/public/product-images/...
    // next/image throws (→ 500 on /product/[id] and /category/[slug]) for any
    // remote host not listed here, so allow the Supabase Storage public path.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/login",
        destination: "/login?redirect=/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
