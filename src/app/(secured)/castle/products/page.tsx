import { ProductsTable } from "@/components/castle/ProductsTable";
import { PageTitle } from "@/src/components/root/PageTitle";
import { getProducts } from "@/actions/prisma/action";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { ProductEditDialog } from "@/components/castle/ProductEditDialog";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-6">
        <PageTitle title="Products Management" />
        <ProductsTable products={products} />
        <ProductEditDialog />
      </div>
    </ErrorBoundary>
  );
}
