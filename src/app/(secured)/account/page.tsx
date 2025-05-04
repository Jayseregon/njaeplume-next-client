"use client";

import { useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Download, CalendarDays } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleSpinner } from "@/components/root/SimpleSpinner";
import { useProductDownload } from "@/src/hooks/useProductDownload";
import { useCartStore } from "@/providers/CartStoreProvider";

function AccountDashboardContent() {
  const { user, isLoaded } = useUser();
  const [latestOrder, setLatestOrder] = useState<OrderWithItems | null>(null);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
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
      toast.success("Payment successful! Your order is complete.");

      // Remove the session_id from the URL without reloading
      router.replace("/account", { scroll: false });
    }
  }, [searchParams, clearCart, setCartOpen, router]);

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

          // Set total orders count
          setTotalOrdersCount(orders.length);

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
    return (
      <div className="p-8 text-center">Loading your account information...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        Please sign in to access your account
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-8">
        <PageTitle title="My Account" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {user.firstName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your digital downloads and order history from your personal
              dashboard.
            </p>
          </div>

          {/* Stats Card - Updated with more descriptive layout */}
          <div className="border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">Your Account</h2>
            <div className="flex justify-between">
              {/* Left side - Orders count */}
              <div className="text-center">
                <p className="text-3xl font-bold">{totalOrdersCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Orders
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
                    Downloadable
                  </p>
                </div>

                {/* Total Downloads */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalDownloadableItems}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Order</h2>
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </div>

          {latestOrder ? (
            <div className="divide-y">
              <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-start">
                  <p className="font-medium">
                    <span className="text-foreground pr-2">Order ID: </span>
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
            <p className="py-4 text-gray-500">
              You haven&apos;t placed any orders yet.
            </p>
          )}
        </div>

        {/* Available Downloads - Updated with real downloads */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Downloads</h2>
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/downloads">View All Downloads</Link>
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
                          Download
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Downloaded on{" "}
                      {new Date(item.downloadedAt!).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-gray-500">
              {totalDownloadableItems > 0
                ? "You have downloads available. Click 'View All Downloads' to see them."
                : "You don't have any downloads yet."}
            </p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Wrap the component in Suspense for useSearchParams
export default function AccountDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          Loading your account information...
        </div>
      }
    >
      <AccountDashboardContent />
    </Suspense>
  );
}
