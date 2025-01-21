"use client";

import { useEffect, useState } from "react";
import { CircularProgress } from "@nextui-org/react";

import { Product } from "@/interfaces/Products";
import { ProductCard } from "@/components/portfolio/ProductCard";

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        setProducts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center">
        <CircularProgress
          aria-label="Loading..."
          classNames={{
            svg: "w-28 h-28 drop-shadow-md",
            indicator: "stroke-foreground",
            track: "stroke-white/10",
          }}
          color={undefined}
          label="Loading..."
          strokeWidth={5}
        />
      </div>
    );
  if (error) return <div>Something went wrong...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-10 md:gap-10 md:mx-20">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
