import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const isLocalDev = process.env.NODE_ENV === "development";

const permissionsPolicy = `
  accelerometer=(), 
  ambient-light-sensor=(), 
  autoplay=(), 
  battery=(), 
  camera=(), 
  display-capture=(), 
  document-domain=(), 
  encrypted-media=(), 
  fullscreen=(), 
  geolocation=(), 
  gyroscope=(), 
  layout-animations=(), 
  legacy-image-formats=(), 
  magnetometer=(), 
  microphone=(), 
  midi=(), 
  navigation-override=(), 
  payment=(), 
  picture-in-picture=(), 
  publickey-credentials-get=(), 
  sync-xhr=(), 
  usb=(), 
  wake-lock=(), 
  web-share=(), 
  xr-spatial-tracking=()
`.replace(/[\n\s]+/g, "");

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === "production",
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "njaeink-remote-pull.b-cdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "njae-plume-public-assets-pull.b-cdn.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return isLocalDev
      ? []
      : [
          {
            source: "/:path*",
            headers: [
              {
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains; preload",
              },
              { key: "X-Frame-Options", value: "SAMEORIGIN" },
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "X-DNS-Prefetch-Control", value: "on" },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
              { key: "Permissions-Policy", value: permissionsPolicy },
            ],
          },
        ];
  },
};

export default withNextIntl(nextConfig);
