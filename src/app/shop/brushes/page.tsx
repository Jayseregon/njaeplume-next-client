"use client";

import { useEffect, useState } from "react";
// import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { ProductsCategoryGallery } from "@/src/components/product/ProductsCategoryGallery";
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
      <ProductsCategoryGallery products={products} />
    </div>
  );
}

// import { Suspense } from "react";
// // import { Metadata } from "next";

// // import { useTranslations } from "next-intl";

// import { PageTitle } from "@/src/components/root/PageTitle";
// import { ProductsCategoryGallery } from "@/src/components/product/ProductsCategoryGallery";
// import { getProductsByCategory } from "@/src/actions/prisma/action";
// import { ProductsGridSkeleton } from "@/src/components/product/Skeletons";

// // export const metadata: Metadata = {
// //   title: "Procreate Brushes | NJAE Plume",
// //   description: "Explore and purchase our collection of premium Procreate brushes.",
// // };

// export default function BrushesPage() {
//   // const t = useTranslations("Portfolio");

//   const productsPromise = getProductsByCategory("brushes");

//   return (
//     <div>
//       <PageTitle title="Brushes" />
//       <div className="py-5" />
//       <Suspense fallback={<ProductsGridSkeleton />}>
//         <ProductsCategoryGallery products={productsPromise} />
//       </Suspense>
//     </div>
//   );
// }
