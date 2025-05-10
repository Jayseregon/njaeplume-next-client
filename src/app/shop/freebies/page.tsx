"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { CategoryGallery } from "@/src/components/product/CategoryGallery";
import { getProductsByCategory } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";

export default function FreebiesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useTranslations("FreebiePage");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const freebies = await getProductsByCategory("freebies");

        if (!freebies) {
          throw new Error("No freebies found");
        }
        setProducts(freebies);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <PageTitle title={t("title")} />
      <div className="py-5" />
      <CategoryGallery products={products} showAsFreebies={true} />
    </div>
  );
}
