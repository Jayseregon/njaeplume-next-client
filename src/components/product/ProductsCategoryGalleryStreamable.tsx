"use client";

import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/components/root/ErrorDefaultDisplay";
import { Product } from "@/src/interfaces/Products";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ProductsGridSkeleton } from "@/src/components/product/Skeletons";
import { Stream, Streamable } from "@/src/lib/streamable";

export const ProductsCategoryGalleryStreamable = ({
  products,
}: {
  products: Streamable<Product[]>;
}) => {
  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <Stream fallback={<ProductsGridSkeleton />} value={products}>
        {(resolvedProducts) => {
          if (!resolvedProducts?.length) {
            return (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-lg font-medium mb-2">
                  No products found
                </div>
                <p className="text-muted-foreground">
                  Check back soon for new items!
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-10 md:gap-10 md:mx-20">
              {resolvedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          );
        }}
      </Stream>
    </ErrorBoundary>
  );
};
