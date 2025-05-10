"use client";

import { useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Download, CalendarDays } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";
import { getUserOrders, getUserWishlist } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";
import { useProductDownload } from "@/src/hooks/useProductDownload";
import { useCartStore } from "@/providers/CartStoreProvider";

function AccountDashboardContent() {
  const t = useTranslations("AccountDashboard");
  const tWishlist = useTranslations("AccountWishlist");
  const { user, isLoaded } = useUser();
  const [latestOrder, setLatestOrder] = useState<OrderWithItems | null>(null);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  // Download stats
  const [totalDownloadableItems, setTotalDownloadableItems] = useState(0);
  const [downloadedItemsCount, setDownloadedItemsCount] = useState(0);

  // Effect for handling successful checkout redirect - added from orders page
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      clearCart();
      setCartOpen(false);
      toast.success(t("paymentSuccess"));

      // Remove the session_id from the URL without reloading
      router.replace("/account", { scroll: false });
    }
  }, [searchParams, clearCart, setCartOpen, router, t]);

  // Download handling
  const { downloadingItems, handleDownload } = useProductDownload((item) => {
    // Update the local state after successful download
    setCompletedOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        items: order.items.map((orderItem) => {
          if (orderItem.id === item.id) {
            return {
              ...orderItem,
              downnloadCount: 1,
              downloadedAt: new Date(),
            };
          }

          return orderItem;
        }),
      })),
    );

    // Update download stats
    setDownloadedItemsCount((prev) => prev + 1);
  });

  useEffect(() => {
    async function fetchUserData() {
      if (user?.id) {
        setIsLoadingData(true);
        try {
          // Fetch all orders to get data
          const orders = await getUserOrders();
          // Fetch wishlist items
          const wishlist = await getUserWishlist();

          // Set total orders count
          setTotalOrdersCount(orders.length);
          // Set wishlist count
          setWishlistCount(wishlist.length);

          // Set latest order if available
          if (orders.length > 0) {
            setLatestOrder(orders[0]); // Assuming orders are already sorted by date (newest first)
          }

          // Filter completed orders for downloads
          const completed = orders.filter(
            (order) => order.status === "COMPLETED",
          );

          setCompletedOrders(completed);

          // Calculate download stats
          let totalItems = 0;
          let downloadedItems = 0;

          completed.forEach((order) => {
            order.items.forEach((item) => {
              totalItems++;
              if (item.downnloadCount > 0 || item.downloadedAt) {
                downloadedItems++;
              }
            });
          });

          setTotalDownloadableItems(totalItems);
          setDownloadedItemsCount(downloadedItems);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    }

    if (isLoaded && user) {
      fetchUserData();
    } else if (isLoaded && !user) {
      setIsLoadingData(false);
    }
  }, [user, isLoaded]);

  // Get downloadable items from the latest completed order
  const getRecentDownloadableItems = () => {
    if (!completedOrders.length) return [];

    // Get the latest completed order
    const latestCompletedOrder = completedOrders[0];

    // Return items that are downloadable
    return latestCompletedOrder.items.map((item) => ({
      ...item,
      orderId: latestCompletedOrder.id,
      orderDisplayId: latestCompletedOrder.displayId,
    }));
  };

  const recentDownloadableItems = getRecentDownloadableItems();

  if (!isLoaded || isLoadingData) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">{t("signInRequired")}</div>;
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-8 max-w-3xl">
        <PageTitle title={t("title")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">
              {t("welcome", { firstName: user.firstName as string })}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t("description")}
            </p>
          </div>

          {/* Stats Card - Updated with more descriptive layout */}
          <div className="border rounded-md p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">{t("yourAccount")}</h2>
            <div className="flex justify-between mt-auto">
              {/* Left side - Orders count */}
              <div className="text-center">
                <p className="text-3xl font-bold">{totalOrdersCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("orders")}
                </p>
              </div>

              {/* Right side - Downloads stats */}
              <div className="flex-1 flex justify-end gap-8">
                {/* Available Downloads */}
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {totalDownloadableItems - downloadedItemsCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("downloadable")}
                  </p>
                </div>

                {/* Total Downloads */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalDownloadableItems}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("totalFiles")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{tWishlist("title")}</h2>
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/wishlist">{t("viewWishlist")}</Link>
            </Button>
          </div>
          {wishlistCount > 0 ? (
            <p>{t("wishlistSummary", { count: wishlistCount })}</p>
          ) : (
            <p className="py-4 text-gray-500">{t("noWishlistItems")}</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t("recentOrder")}</h2>
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/orders">{t("viewAllOrders")}</Link>
            </Button>
          </div>

          {latestOrder ? (
            <div className="divide-y">
              <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-start">
                  <p className="font-medium">
                    <span className="text-foreground pr-2">{t("orderId")}</span>
                    {latestOrder.displayId}
                  </p>
                  <p className="text-gray-500">
                    {formatDate(latestOrder.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-semibold text-lg">
                    {formatPrice(latestOrder.amount)}
                  </p>
                  <Badge variant="bordered">{latestOrder.status}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-4 text-gray-500">{t("noOrdersYet")}</p>
          )}
        </div>

        {/* Available Downloads - Updated with real downloads */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t("recentDownloads")}</h2>
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/downloads">{t("viewAllDownloads")}</Link>
            </Button>
          </div>

          {recentDownloadableItems.length > 0 ? (
            <div className="space-y-4">
              {recentDownloadableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-start border-b pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.product.name}
                      <span className="ml-2 text-xs text-foreground">
                        {item.product.category}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.orderDisplayId}
                    </p>
                  </div>

                  {/* Conditional rendering based on download status */}
                  {item.downnloadCount === 0 && !item.downloadedAt ? (
                    <Button
                      className="w-fit"
                      disabled={downloadingItems[item.id]}
                      size="xs"
                      variant="form"
                      onClick={() => handleDownload(item, item.orderId)}
                    >
                      {downloadingItems[item.id] ? (
                        <SimpleSpinner />
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          {t("downloadButton")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {t("downloadedOn", {
                        date: new Date(item.downloadedAt!).toLocaleDateString(),
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-gray-500">
              {totalDownloadableItems > 0
                ? t("downloadsAvailable")
                : t("noDownloadsYet")}
            </p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Wrap the component in Suspense for useSearchParams
export default function AccountDashboard() {
  const t = useTranslations("AccountDashboard"); // Initialize translations for fallback

  return (
    <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
      <AccountDashboardContent />
    </Suspense>
  );
}
