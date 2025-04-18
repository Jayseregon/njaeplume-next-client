import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/components/root/ErrorDefaultDisplay";
import { Product } from "@/src/interfaces/Products";
import { ProductCard } from "@/src/components/product/ProductCard";
import { FreebieCard } from "@/src/components/product/FreebieCard";

interface CategoryGalleryProps {
  products: Product[];
  showAsFreebies?: boolean;
}

export const CategoryGallery = ({
  products,
  showAsFreebies = false,
}: CategoryGalleryProps) => {
  if (!products?.length) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin border-4 rounded-full w-12 h-12 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-10 md:gap-10 md:mx-20">
        {products.map((product) =>
          showAsFreebies || product.category === "freebies" ? (
            <FreebieCard key={product.id} product={product} />
          ) : (
            <ProductCard key={product.id} product={product} />
          ),
        )}
      </div>
    </ErrorBoundary>
  );
};
