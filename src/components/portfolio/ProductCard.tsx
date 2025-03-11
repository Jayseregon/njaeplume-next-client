import Image from "next/image";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { Product } from "@/interfaces/Products";

export const ProductCard = ({ product }: { product: Product }) => {
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

  return (
    <Card className="rounded-2xl pt-3 text-foreground">
      <CardHeader>
        <h3 className="text-xl pb-1 font-bold">{product.name}</h3>
        <p className="italic text-sm pb-2">{product.category}</p>
      </CardHeader>
      <CardContent>
        <div className="pb-8">
          {product.images[0] && (
            <ErrorBoundary
              fallback={
                <div className="w-5/6 mx-auto p-4 text-center bg-stone-100">
                  <p>Failed to load image</p>
                </div>
              }
            >
              <div
                key={product.images[0].id}
                className="w-5/6 mx-auto bg-stone-200"
              >
                <Image
                  alt={
                    product.images[0].alt_text ||
                    "default product image alt text"
                  }
                  className="w-full h-auto object-contain"
                  height={600}
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={`${pullZone}/${product.images[0].url}`}
                  width={800}
                />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
