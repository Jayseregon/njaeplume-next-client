"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";
import { getUserWishlist } from "@/src/actions/prisma/action";
import { Product } from "@/interfaces/Products";
import { CategoryGallery } from "@/src/components/product/CategoryGallery";

export default function WishlistPage() {
  const t = useTranslations("AccountWishlist");
  const { isLoaded, isSignedIn } = useUser();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handler for when an item is removed from the wishlist via ProductCard
  const handleWishlistItemRemoved = (removedProductId: string) => {
    setWishlistItems((currentItems) =>
      currentItems.filter((item) => item.id !== removedProductId),
    );
    // Optionally, you might want to refetch the wishlist count for the dashboard if it's displayed elsewhere
    // or manage a global state for wishlist count.
  };

  useEffect(() => {
    async function fetchWishlist() {
      if (isSignedIn) {
        try {
          setIsLoading(true);
          const userWishlist = await getUserWishlist();

          setWishlistItems(userWishlist);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
          toast.error(t("errorLoading"));
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isLoaded && isSignedIn) {
      fetchWishlist();
    } else if (isLoaded && !isSignedIn) {
      // If user data is loaded but there's no signed-in user, stop loading
      setIsLoading(false);
      setWishlistItems([]); // Clear items if user signs out
    }
  }, [isSignedIn, isLoaded, t]);

  if (!isLoaded || (isLoading && isSignedIn)) {
    // Show loading only if signed in and still loading
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  if (!isSignedIn) {
    return <div className="p-8 text-center">{t("signInRequired")}</div>;
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-6">
        <Button
          asChild
          className="mb-4 text-foreground"
          size="sm"
          variant="ghost"
        >
          <Link className="flex items-center" href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToDashboard")}
          </Link>
        </Button>

        <PageTitle title={t("title")} />

        {wishlistItems.length > 0 ? (
          <CategoryGallery
            products={wishlistItems}
            onWishlistItemRemoved={handleWishlistItemRemoved} // Pass the handler
          />
        ) : (
          <div className="border rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">{t("noItemsTitle")}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t("noItemsMessage")}
            </p>
            <Button asChild variant="default">
              <Link href="/shop">{t("goShopping")}</Link>
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
