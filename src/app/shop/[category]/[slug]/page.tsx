import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/ProductDetail";
import { getProductBySlug } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";
import { Category } from "@/generated/client";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Helper to validate category
const isCategoryValid = (category: string): category is Category => {
  return Object.values(Category).includes(category as Category);
};

// Generate metadata for the product page
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // Get the slug from params
  const { slug, category } = await params;

  // Validate category
  if (!isCategoryValid(category)) {
    return {
      title: "Category Not Found",
    };
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${product.name} | ${categoryName}`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, category } = await params;

  // Validate category
  if (!isCategoryValid(category)) {
    return notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  // Verify that product belongs to the correct category
  if (product.category !== category) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product as Product} />
    </div>
  );
}
