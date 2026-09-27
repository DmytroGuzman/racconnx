import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const logoHeaders = [
  {
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",
  },
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      /*
       * Default security headers for the whole website.
       */
      {
        source: "/(.*)",
        headers: securityHeaders,
      },

      /*
       * Public RCX logo used by external services
       * such as Jupiter.
       *
       * This rule comes AFTER the global rule,
       * so these headers override the logo-specific values.
       */
      {
        source: "/logo512.png",
        headers: logoHeaders,
      },
    ];
  },
};

export default nextConfig;