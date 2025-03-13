"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/src/interfaces/Products";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";

export function ProductDetail({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

  const hasMultipleImages = product.images.length > 1;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const navigateImage = (direction: number) => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + direction;

      if (newIndex < 0) return product.images.length - 1;
      if (newIndex >= product.images.length) return 0;

      return newIndex;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Back button for mobile */}
      <div className="lg:hidden mb-2">
        <Button asChild size="sm" variant="ghost">
          <Link className="flex items-center" href="/shop/brushes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Brushes
          </Link>
        </Button>
      </div>

      {/* Image Gallery - Takes 3 columns on desktop */}
      <div className="lg:col-span-3 space-y-4">
        <div className="hidden lg:block">
          <Button asChild size="sm" variant="ghost">
            <Link className="flex items-center" href="/shop/brushes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Brushes
            </Link>
          </Button>
        </div>

        <ErrorBoundary
          fallback={
            <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
              <p>Failed to load image</p>
            </div>
          }
        >
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images.length > 0 && (
              <Image
                fill
                priority
                alt={
                  product.images[currentImageIndex]?.alt_text || product.name
                }
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                src={`${pullZone}/${product.images[currentImageIndex]?.url}`}
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
          <div className="flex gap-2 overflow-auto pb-2 px-1">
            {product.images.map((image, i) => (
              <button
                key={image.id}
                className={`flex-shrink-0 relative h-20 w-20 rounded-md overflow-hidden transition-all ${
                  currentImageIndex === i
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setCurrentImageIndex(i)}
              >
                <Image
                  fill
                  alt={image.alt_text || `${product.name} thumbnail ${i + 1}`}
                  className="object-cover"
                  sizes="80px"
                  src={`${pullZone}/${image.url}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info - Takes 2 columns on desktop */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="capitalize" variant="secondary">
              {product.category}
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-primary">
            {formattedPrice}
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="font-medium text-xl mb-3">Description</h2>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>

        {product.tags.length > 0 && (
          <div>
            <h2 className="font-medium text-lg mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-medium text-lg mb-3">What You&apos;ll Get</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-sm">
                  Download file:{" "}
                  <span className="font-medium">{product.zip_file_name}</span>
                </span>
              </li>
              <li className="text-sm">Instant download after purchase</li>
            </ul>
          </CardContent>
        </Card>

        <div className="pt-4 flex flex-col gap-3">
          <Button className="w-full" size="lg">
            Buy Now - {formattedPrice}
          </Button>
          <Button className="w-full" size="lg" variant="outline">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
