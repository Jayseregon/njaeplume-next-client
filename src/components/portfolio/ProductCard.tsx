import Image from "next/image";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { Product } from "@/interfaces/Products";

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="rounded-2xl pt-3">
      <CardHeader>
        <h3 className="text-xl pb-1 font-bold">{product.old_name}</h3>
        <p className="italic text-sm pb-2">{product.old_category}</p>
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
                    product.images[0].old_alt_text ||
                    "default product image alt text"
                  }
                  className="w-full h-auto object-contain"
                  height={600}
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={`https://njaeink-remote-pull.b-cdn.net/${product.images[0].old_url}`}
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
