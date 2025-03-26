"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { CategoryRowProps } from "@/src/interfaces/Products";
import { ProductCard } from "@/src/components/product/ProductCard";
import { SectionTitle } from "@/src/components/root/SectionTitle";
import { getNavItemByKey } from "@/config/site";

export const CategoryRow = ({ category, products }: CategoryRowProps) => {
  const t = useTranslations("Shop");
  const displayProducts = products.slice(0, 3);
  const categoryNavItem = getNavItemByKey(category);
  const categoryTitle = t(`categoryTitles.${category}`);

  return (
    <div className="my-8">
      <div className="mb-4">
        <SectionTitle title={categoryTitle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        <Link
          className="flex flex-col justify-center items-center border-2 border-dashed border-muted rounded-2xl p-8 my-auto self-center transition-all duration-200 hover:border-primary hover:shadow-md hover:scale-[1.02]"
          href={categoryNavItem.href}
        >
          <ArrowRight className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">
            {t(`seeAllButton.${category}`)}
          </span>
        </Link>
      </div>
    </div>
  );
};
