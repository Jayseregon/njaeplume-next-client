import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/private/",
          "/admin/",
          "/login/",
          "/signin/",
          "/castle/",
          "/account/",
        ],
      },
    ],
    sitemap: "https://www.njaeplume.com/sitemap.xml",
  };
}
