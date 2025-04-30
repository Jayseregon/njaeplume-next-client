"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link"; // Import Link

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AccountDashboard() {
  const { user, isLoaded } = useUser();
  const [latestOrder, setLatestOrder] = useState<OrderWithItems | null>(null);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [recentDownloads, setRecentDownloads] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      if (user?.id) {
        setIsLoadingData(true);
        try {
          // Fetch latest order (limit 1) and total count
          const [ordersResult, countResult] = await Promise.allSettled([
            getUserOrders({ limit: 1 }),
            getUserOrders(), // Fetch all to get the count (could be optimized later)
          ]);

          if (
            ordersResult.status === "fulfilled" &&
            ordersResult.value.length > 0
          ) {
            setLatestOrder(ordersResult.value[0]);
          }
          if (countResult.status === "fulfilled") {
            setTotalOrdersCount(countResult.value.length);
          }
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
      setIsLoadingData(false); // Stop loading if user is loaded but not present
    }
  }, [user, isLoaded]);

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

          {/* Stats Card - Updated */}
          <div className="border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">Your Account</h2>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalOrdersCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Orders
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Downloads
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders - Updated */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Order</h2>
            {/* Updated Button to Link */}
            <Button asChild className="max-w-fit" variant="form">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </div>

          {latestOrder ? (
            <div className="divide-y">
              <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-start">
                  <p className="font-medium">
                    Order ID: {latestOrder.displayId}
                  </p>
                  <p className="text-gray-500">
                    Date: {formatDate(latestOrder.createdAt)}
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

        {/* Available Downloads */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Downloads</h2>
            <Button disabled className="max-w-fit" variant="form">
              Coming Soon
            </Button>
          </div>

          {recentDownloads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Map through downloads here */}
              <p className="py-4">No downloads available</p>
            </div>
          ) : (
            <p className="py-4 text-gray-500">
              You don&apos;t have any downloads yet.
            </p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
