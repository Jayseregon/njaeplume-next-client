"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

import { PageTitle } from "@/src/components/root/PageTitle";
import { CategoryGallery } from "@/src/components/product/CategoryGallery";
import { getProductsByCategory } from "@/src/actions/prisma/action";
import { Product } from "@/src/interfaces/Products";
import { Category } from "@/generated/client";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";

// Helper to validate and format category
const isCategoryValid = (category: string): category is Category => {
  return Object.values(Category).includes(category as Category);
};

const getCategoryTitle = (category: string): string => {
  // Capitalize the first letter
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.category as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate that the category is valid
    if (!categorySlug || !isCategoryValid(categorySlug)) {
      notFound();
    }

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const categoryProducts = await getProductsByCategory(categorySlug);

        if (!categoryProducts) {
          throw new Error(`No ${categorySlug} found`);
        }
        setProducts(categoryProducts);
      } catch (err) {
        console.error(`Failed to fetch ${categorySlug} products:`, err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [categorySlug]);

  // Handle invalid categories
  if (!categorySlug || !isCategoryValid(categorySlug)) {
    return notFound();
  }

  const categoryTitle = getCategoryTitle(categorySlug);

  return (
    <div>
      <PageTitle title={categoryTitle} />
      <div className="py-5" />
      {isLoading ? (
        <div className="items-center justify-center flex">
          <SimpleSpinner className="w-12 h-12 text-foreground" />
        </div>
      ) : (
        <CategoryGallery products={products} />
      )}
    </div>
  );
}
