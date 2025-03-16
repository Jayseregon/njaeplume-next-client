"use client";

import { useEffect, useState } from "react";
// import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { CategoryGallery } from "@/src/components/product/CategoryGallery";
import { getProductsByCategory } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";

export default function BrushesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // const t = useTranslations("Portfolio");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const brushes = await getProductsByCategory("brushes");

        if (!brushes) {
          throw new Error("No brushes found");
        }
        setProducts(brushes);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <PageTitle title="Brushes" />
      <div className="py-5" />
      <CategoryGallery products={products} />
    </div>
  );
}
