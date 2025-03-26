"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { OrdersTable } from "@/src/components/account/OrdersTable";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user?.id) {
        try {
          setIsLoading(true);
          // Replace with your actual data fetching
          // const userOrders = await getUserOrders(user.id);
          // setOrders(userOrders);
          setOrders([]); // Placeholder
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isLoaded) {
      fetchOrders();
    }
  }, [user, isLoaded]);

  if (!isLoaded || isLoading) {
    return <div className="p-8 text-center">Loading your orders...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">Please sign in to view your orders</div>
    );
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
            Back to Dashboard
          </Link>
        </Button>

        <PageTitle title="Order History" />

        {orders.length > 0 ? (
          <OrdersTable orders={orders} />
        ) : (
          <div className="border rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No orders found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
