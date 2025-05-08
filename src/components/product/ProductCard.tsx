import Image from "next/image";
import Link from "next/link";
import { CircleEllipsis, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { Product } from "@/interfaces/Products";
import { useCartStore } from "@/providers/CartStoreProvider";
import { formatPrice } from "@/lib/utils";
import {
  addToWishlist,
  removeFromWishlist,
  isProductInWishlist,
} from "@/src/actions/prisma/action";

interface ProductCardProps {
  product: Product;
  onWishlistChange?: (productId: string) => void;
}

export const ProductCard = ({
  product,
  onWishlistChange,
}: ProductCardProps) => {
  const t = useTranslations("ProductCard");
  const tWishlist = useTranslations("Wishlist");
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;
  const addToCart = useCartStore((state) => state.addToCart);
  const { isSignedIn } = useUser();

  const [isLiked, setIsLiked] = useState(false);
  const [isLikeActionLoading, setIsLikeActionLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn && product.id) {
      const checkWishlistStatus = async () => {
        setIsLikeActionLoading(true);
        try {
          const status = await isProductInWishlist(product.id);

          setIsLiked(status);
        } catch (error) {
          console.error("Failed to check wishlist status", error);
        } finally {
          setIsLikeActionLoading(false);
        }
      };

      checkWishlistStatus();
    } else {
      setIsLiked(false);
    }
  }, [isSignedIn, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    // Prevent the card link from being triggered
    e.preventDefault();
    e.stopPropagation();

    // Add to cart using our store
    addToCart(product);
    toast.info(t("addToCartSuccess", { productName: product.name }));
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error(tWishlist("signInRequired"));

      return;
    }
    if (isLikeActionLoading) return;

    setIsLikeActionLoading(true);
    const originalIsLiked = isLiked;

    setIsLiked(!originalIsLiked); // Optimistic update

    try {
      if (!originalIsLiked) {
        await addToWishlist(product.id);
        toast.success(tWishlist("added", { productName: product.name }));
        if (onWishlistChange) onWishlistChange(product.id); // Call callback on add
      } else {
        await removeFromWishlist(product.id);
        toast.success(tWishlist("removed", { productName: product.name }));
        if (onWishlistChange) onWishlistChange(product.id); // Call callback on remove
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
      toast.error(tWishlist("error"));
      setIsLiked(originalIsLiked); // Revert on error
    } finally {
      setIsLikeActionLoading(false);
    }
  };

  return (
    <Link
      className="block group"
      href={`/shop/${product.category}/${product.slug}`}
    >
      <Card className="rounded-2xl pt-3 text-foreground transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden">
        {/* Details indicator in top right corner */}
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
          {isSignedIn && ( // Show like button only if signed in
            <Button
              className="p-1 h-7 w-7 rounded-full hover:bg-rose-100 dark:hover:bg-rose-800"
              disabled={isLikeActionLoading}
              size="icon"
              title={
                isLiked
                  ? tWishlist("removeFromWishlist")
                  : tWishlist("addToWishlist")
              }
              variant="ghost"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={`h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground group-hover:text-rose-500"}`}
              />
            </Button>
          )}
          <CircleEllipsis className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </div>

        <CardHeader>
          <h3 className="text-xl pb-1 font-bold">{product.name}</h3>
          <p className="italic text-sm pb-2 capitalize">
            {t(`category.${product.category}`)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="pb-5">
            {product.images[0] && (
              <ErrorBoundary
                fallback={
                  <div className="w-5/6 mx-auto p-4 text-center bg-stone-100">
                    <p>{t("imageLoadError")}</p>
                  </div>
                }
              >
                <div
                  key={product.images[0].id}
                  className="w-5/6 mx-auto bg-stone-200 relative"
                >
                  <Image
                    alt={product.images[0].alt_text}
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
          <Button
            className="flex items-center space-x-2 w-full sm:w-auto"
            size="sm"
            title={t("addToCartButtonTitle")}
            variant="form"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{formatPrice(product.price)}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
