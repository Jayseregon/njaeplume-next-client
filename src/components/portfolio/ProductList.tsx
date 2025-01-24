import { getProducts } from "@/actions/prisma/action";
import { ProductCard } from "@/components/portfolio/ProductCard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function ProductList() {
  const products = await getProducts();

  if (!products?.length) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin border-4 rounded-full w-12 h-12 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="text-center p-4">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p>We were not able to load our products. Please try again later.</p>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-10 md:gap-10 md:mx-20">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </ErrorBoundary>
  );
}
