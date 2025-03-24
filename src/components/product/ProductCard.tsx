import Image from "next/image";
import Link from "next/link";
import { CircleEllipsis, Hourglass } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { Product } from "@/interfaces/Products";

export const ProductCard = ({ product }: { product: Product }) => {
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

  // const handleAddToCart = (e: React.MouseEvent) => {
  //   // Prevent the card link from being triggered
  //   e.preventDefault();
  //   e.stopPropagation();

  //   // Add to cart logic would go here
  //   console.log(`Added ${product.name} to cart`);

  //   // You could also call a function from props or use context
  //   // addToCart(product);
  // };

  return (
    <Link
      className="block group"
      href={`/shop/${product.category}/${product.slug}`}
    >
      <Card className="rounded-2xl pt-3 text-foreground transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden">
        {/* Details indicator in top right corner */}
        <div className="absolute top-2 right-2 z-10">
          <CircleEllipsis className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </div>

        <CardHeader>
          <h3 className="text-xl pb-1 font-bold">{product.name}</h3>
          <p className="italic text-sm pb-2">{product.category}</p>
        </CardHeader>
        <CardContent>
          <div className="pb-5">
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
                  className="w-5/6 mx-auto bg-stone-200 relative"
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
        <CardFooter className="justify-center items-center pt-0 pb-3">
          {/* <Button
            className="flex items-center space-x-2 w-full sm:w-auto"
            size="sm"
            title="Add to cart"
            variant="form"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>${product.price.toFixed(2)}</span>
          </Button> */}
          <Button
            className="flex items-center space-x-2 w-full sm:w-auto"
            size="sm"
            title="Add to cart"
            variant="form"
          >
            <Hourglass className="h-4 w-4" />
            <span>Coming Soon...</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
