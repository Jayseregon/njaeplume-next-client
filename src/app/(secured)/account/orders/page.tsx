"use client";

import { useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { OrdersTable } from "@/src/components/account/OrdersTable";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";
import { useCartStore } from "@/providers/CartStoreProvider";

function OrdersPageComponent() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  // Effect for handling successful checkout redirect
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      console.log("Checkout successful, clearing cart...");
      clearCart();
      setCartOpen(false);
      toast.success("Payment successful! Your order is complete.");

      // Optional: Remove the session_id from the URL without reloading
      const currentPath = window.location.pathname;

      router.replace(currentPath, { scroll: false });
    }
    // This effect should only run once when the component mounts and searchParams are available
  }, [searchParams]);

  // Effect for fetching orders
  useEffect(() => {
    async function fetchOrders() {
      if (user?.id) {
        try {
          setIsLoading(true);
          const userOrders = await getUserOrders();

          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load your order history.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isLoaded && user) {
      fetchOrders();
    } else if (isLoaded && !user) {
      // If user data is loaded but there's no user, stop loading
      setIsLoading(false);
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
            <Button asChild variant="default">
              <Link href="/shop">Go Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Wrap the component in Suspense for useSearchParams
export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <OrdersPageComponent />
    </Suspense>
  );
}
