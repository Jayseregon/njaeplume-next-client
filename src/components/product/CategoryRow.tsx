"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { CategoryRowProps } from "@/src/interfaces/Products";
import { ProductCard } from "@/src/components/product/ProductCard";
import { getNavItemByKey } from "@/config/site";

export const CategoryRow = ({ category, products }: CategoryRowProps) => {
  const t = useTranslations("Shop");
  const displayProducts = products.slice(0, 4);
  const categoryNavItem = getNavItemByKey(category);
  const categoryTitle = t(`categoryTitles.${category}`);

  return (
    <div className="my-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3">{categoryTitle}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link
        className="flex flex-row justify-center items-center w-full border-2 border-dashed border-muted rounded-2xl py-4 px-8 mt-6 transition-all duration-200 hover:border-primary hover:shadow-md hover:scale-[1.02]"
        href={categoryNavItem.href}
      >
        <ArrowRight className="h-6 w-6 mr-2 text-foreground" />
        <span className="text-lg font-medium text-foreground">
          {t(`seeAllButton.${category}`)}
        </span>
      </Link>
    </div>
  );
};
