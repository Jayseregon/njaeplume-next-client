import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Fixed generateMetadata to properly handle params
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // Get the slug from params
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | NJAE Plume Stickers`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Optional: add a wrapper for future loading/skeleton state */}
      <ProductDetail product={product as Product} />
    </div>
  );
}
