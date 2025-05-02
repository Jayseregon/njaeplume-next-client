import { MetadataRoute } from "next";

import { getProducts } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use localhost for development, production URL for production
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://www.njaeplume.com";

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
    // Main pages
    { path: "", changeFrequency: "daily", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5 },

    // Shop pages
    { path: "/shop", changeFrequency: "weekly", priority: 0.8 },
    { path: "/shop/brushes", changeFrequency: "weekly", priority: 0.7 },
    { path: "/shop/stickers", changeFrequency: "weekly", priority: 0.7 },
    { path: "/shop/templates", changeFrequency: "weekly", priority: 0.7 },
    { path: "/shop/planners", changeFrequency: "weekly", priority: 0.7 },
    { path: "/shop/freebies", changeFrequency: "weekly", priority: 0.7 },

    // Policy pages
    {
      path: "/policies/returns-refunds",
      changeFrequency: "monthly",
      priority: 0.4,
    },
    { path: "/policies/shipping", changeFrequency: "monthly", priority: 0.4 },
    { path: "/policies/eula", changeFrequency: "monthly", priority: 0.4 },
  ];

  // Fetch all products for dynamic routes
  let products: Product[] = [];

  try {
    products = await getProducts();
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  // Generate product pages routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/shop/${product.category}/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Combine all routes
  return [
    // Static routes
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    // Dynamic product routes
    ...productRoutes,
  ];
}
