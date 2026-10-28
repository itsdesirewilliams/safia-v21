import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // One canonical host: everything served on www moves to the apex domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.safewaytyre.com" }],
        destination: "https://safewaytyre.com/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    // The single-file upload form posts through a server action; allow the
    // documented image limit (the Gallery bulk upload streams to Supabase
    // directly and is unaffected by this).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // Supabase Storage public objects (shared Media layer, Ticket 4).
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
