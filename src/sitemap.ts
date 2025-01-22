import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.njaeplume.com";

  // Static routes
  const staticRoutes: Array<{
    path: string;
    changeFrequency:
      | "weekly"
      | "yearly"
      | "monthly"
      | "always"
      | "hourly"
      | "daily"
      | "never";
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
  ];

  // Combine all routes
  return [
    // Static routes
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
  ];
}
