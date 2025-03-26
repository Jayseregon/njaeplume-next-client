"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";

export default function AccountDashboard() {
  const { user, isLoaded } = useUser();
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);

  useEffect(() => {
    // Fetch recent orders and downloads
    async function fetchUserData() {
      if (user?.id) {
        try {
          // Replace with your actual data fetching
          // const orders = await getUserOrders(user.id, { limit: 3 });
          // const downloads = await getUserDownloads(user.id, { limit: 3 });
          // setRecentOrders(orders);
          // setRecentDownloads(downloads);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }

    if (isLoaded) {
      fetchUserData();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
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
              Manage your digital products and order history from your personal
              dashboard.
            </p>
          </div>

          {/* Stats Card */}
          <div className="border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">Your Account</h2>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold">0</p>
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

        {/* Recent Orders */}
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Button disabled className="text-sm" variant="outline">
              Coming Soon
            </Button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y">
              {/* Map through recent orders here */}
              <p className="py-4">No orders yet</p>
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
            <Button disabled className="text-sm" variant="outline">
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
