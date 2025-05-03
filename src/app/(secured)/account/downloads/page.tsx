"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getUserOrders } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";

export default function DownloadsPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user?.id) {
        try {
          setIsLoading(true);
          // Fetch actual orders
          const userOrders = await getUserOrders();
          // Filter for completed orders only, as only those should have downloads
          const completedOrders = userOrders.filter(
            (order) => order.status === "COMPLETED"
          );
          setOrders(completedOrders);
        } catch (error) {
          console.error("Error fetching orders for downloads:", error);
          toast.error("Failed to load your downloadable products.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isLoaded && user) {
      fetchOrders();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const handleDownload = (productId: string, orderId: string) => {
    // Placeholder for download logic
    console.log(
      `Download requested for product ${productId} from order ${orderId}`
    );
    toast.info("Download functionality not yet implemented.");
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="p-8 text-center">Loading your digital products...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        Please sign in to access your downloads
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="space-y-6">
        <Button
          asChild
          className="mb-4 text-foreground"
          size="sm"
          variant="ghost">
          <Link
            className="flex items-center"
            href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <PageTitle title="My Downloads" />

        {orders.length > 0 ? (
          <Accordion
            type="multiple"
            className="w-full rounded-md border"
            defaultValue={orders.length > 0 ? [orders[0].id] : []}>
            {orders.map((order) => (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border-b last:border-b-0">
                <AccordionTrigger className="px-4 hover:no-underline text-left bg-foreground/20">
                  <span>{order.displayId}</span>
                  <div className="px-10" />
                  <span className="ml-auto mr-4 text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <ul className="space-y-0">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between border-b py-3 last:border-b-0">
                        <div>
                          <span className="font-medium">
                            {item.product.name}
                          </span>
                          <span className="ml-2 text-xs text-foreground">
                            {item.product.category}
                          </span>
                        </div>
                        <Button
                          size="xs"
                          variant="form"
                          className="w-fit"
                          onClick={() =>
                            handleDownload(item.productId, order.id)
                          }>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="border rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">
              No downloadable products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven&apos;t purchased any digital products yet, or your
              orders are still processing.
            </p>
            <Button
              asChild
              variant="default">
              <Link href="/shop">Go Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
