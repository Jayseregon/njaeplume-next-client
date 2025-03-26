import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { CategoryRow } from "@/src/components/product/CategoryRow";
import { getLatestProductsByCategory } from "@/src/actions/prisma/action";
import { CategoryRowProps } from "@/src/interfaces/Products";

// Simple loading skeleton for categories
const CategoryRowSkeleton = () => (
  <div className="my-8 animate-pulse">
    <div className="h-8 w-48 bg-muted rounded mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-72 bg-muted rounded-2xl" />
      ))}
    </div>
  </div>
);

// Component to load and display category data
const CategoryRows = async ({ comingSoon }: { comingSoon: string }) => {
  const populatedCategories = await getLatestProductsByCategory(3);

  if (!populatedCategories || populatedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">{comingSoon}</p>
      </div>
    );
  }

  return (
    <>
      {populatedCategories.map(({ category, products }: CategoryRowProps) => (
        <CategoryRow key={category} category={category} products={products} />
      ))}
    </>
  );
};

export default function ShopPage() {
  const t = useTranslations("Shop");

  return (
    <div>
      <PageTitle title={t("title")} />

      <div className="container px-4 py-8 mx-auto">
        <p className="text-lg text-center mb-8">{t("pageIntro")}</p>

        <Suspense
          fallback={
            <>
              <CategoryRowSkeleton />
              <CategoryRowSkeleton />
            </>
          }
        >
          <CategoryRows comingSoon={t("comingSoon")} />
        </Suspense>
      </div>
    </div>
  );
}
