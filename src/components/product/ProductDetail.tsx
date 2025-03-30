"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/src/interfaces/Products";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { PageTitle } from "@/src/components/root/PageTitle";
import { getProductSpecificationsByCategory } from "@/src/lib/specsSelector";
import { useCartStore } from "@/providers/CartStoreProvider";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

  // Extract only the specific functions we need from the store
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const hasMultipleImages = product.images.length > 1;

  const navigateImage = (direction: number) => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + direction;

      if (newIndex < 0) return product.images.length - 1;
      if (newIndex >= product.images.length) return 0;

      return newIndex;
    });
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.info(`${product.name} has been added to your cart.`);

    // Optional: open the cart drawer after adding the item
    setTimeout(() => toggleCart(), 300);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4">
      {/* Back button visible on all screen sizes */}
      <Button
        asChild
        className="mb-4 text-foreground"
        size="sm"
        variant="ghost"
      >
        <Link className="flex items-center" href="/shop/brushes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {product.category}
        </Link>
      </Button>

      {/* Title and price for mobile - appears before images */}
      <div className="md:hidden mb-6">
        <PageTitle title={product.name} />
        <div className="flex items-center justify-between mt-4">
          <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
          <Button
            className="whitespace-nowrap w-32 flex items-center gap-2"
            size="sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <ErrorBoundary
            fallback={
              <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
                <p>Failed to load image</p>
              </div>
            }
          >
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              {product.images.length > 0 && (
                <Image
                  fill
                  priority
                  alt={product.images[currentImageIndex].alt_text}
                  className="object-contain transition-opacity duration-300 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={`${pullZone}/${product.images[currentImageIndex].url}`}
                />
              )}

              {hasMultipleImages && (
                <>
                  <Button
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                    size="icon"
                    variant="secondary"
                    onClick={() => navigateImage(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                    size="icon"
                    variant="secondary"
                    onClick={() => navigateImage(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </ErrorBoundary>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-auto py-2 px-1">
              {product.images.map((image, i) => (
                <button
                  key={image.id}
                  aria-label={`View thumbnail ${i + 1}`}
                  className={`flex-shrink-0 relative h-20 w-20 rounded-md overflow-hidden transition-all transform hover:scale-105 focus:scale-95 ${
                    currentImageIndex === i
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(i)}
                >
                  <Image
                    fill
                    alt={image.alt_text}
                    className="object-cover"
                    sizes="70px"
                    src={`${pullZone}/${image.url}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title for desktop */}
          <div className="hidden md:block">
            <PageTitle title={product.name} />
          </div>

          {/* Price and add to cart for desktop */}
          <div className="hidden md:flex items-center justify-between">
            <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            <Button
              className="w-40 flex items-center gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Separator className="my-10" />

          {/* Description */}
          <div>
            <p className="whitespace-pre-wrap text-justify text-lg">
              {product.description}
            </p>
          </div>

          {/* Tags - limited to 13 */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 my-6">
              {product.tags.slice(0, 13).map((tag) => (
                <Badge key={tag.id} variant="primary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="mt-10 mb-0" />

          {/* Product Specifications */}
          <div className="w-full text-justify">
            {getProductSpecificationsByCategory(product.category)}
          </div>
        </div>
      </div>
    </div>
  );
}
