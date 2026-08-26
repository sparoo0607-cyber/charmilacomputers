import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
