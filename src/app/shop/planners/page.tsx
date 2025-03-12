"use client";

import { useEffect, useState } from "react";
// import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { ProductsCategoryList } from "@/src/components/product/ProductsCategoryList";
import { getProductsByCategory } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";

export default function PlannersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // const t = useTranslations("Portfolio");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const planners = await getProductsByCategory("planners");

        if (!planners) {
          throw new Error("No stickers found");
        }
        setProducts(planners);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <PageTitle title="Stickers" />
      <div className="py-5" />
      <ProductsCategoryList products={products} />
    </div>
  );
}
