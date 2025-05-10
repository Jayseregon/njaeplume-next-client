"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Download, CalendarDays } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
import { SimpleSpinner } from "@/components/root/SimpleSpinner";
import { useProductDownload } from "@/src/hooks/useProductDownload";

export default function DownloadsPage() {
  const t = useTranslations("AccountDownloads");
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function will be called by the hook on successful download
  const handleSuccessfulDownload = (item: any, orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((orderItem) => {
              if (orderItem.id === item.id) {
                return {
                  ...orderItem,
                  downnloadCount: (orderItem.downnloadCount || 0) + 1, // Ensure count is incremented
                  downloadedAt: new Date(),
                };
              }

              return orderItem;
            }),
          };
        }

        return order;
      }),
    );
  };

  // Use the shared download hook, passing the success callback
  const { downloadingItems, handleDownload: triggerProductDownload } =
    useProductDownload(handleSuccessfulDownload);

  useEffect(() => {
    async function fetchOrders() {
      if (user?.id) {
        try {
          setIsLoading(true);
          // Fetch actual orders
          const userOrders = await getUserOrders();
          // Filter for completed orders only, as only those should have downloads
          const completedOrders = userOrders.filter(
            (order) => order.status === "COMPLETED",
          );

          setOrders(completedOrders);
        } catch (error) {
          console.error("Error fetching orders for downloads:", error);
          toast.error(t("errorLoading"));
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
  }, [user, isLoaded, t]); // Add t to dependency array

  if (!isLoaded || isLoading) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  if (!user) {
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

        {orders.length > 0 ? (
          <Accordion
            className="w-full rounded-md border"
            defaultValue={orders.length > 0 ? [orders[0].id] : []}
            type="multiple"
          >
            {orders.map((order) => (
              <AccordionItem
                key={order.id}
                className="border-b last:border-b-0"
                value={order.id}
              >
                <AccordionTrigger className="px-4 hover:no-underline text-left bg-foreground/20">
                  <span>{order.displayId}</span>
                  <div className="px-20" />
                  <span className="ml-auto mr-4 text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <ul className="space-y-0">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between border-b py-3 last:border-b-0"
                      >
                        <div>
                          <span className="font-medium">
                            {item.product.name}
                          </span>
                          <span className="ml-2 text-xs text-foreground">
                            {item.product.category}
                          </span>
                        </div>

                        {/* Conditional rendering based on download status */}
                        {item.downnloadCount === 0 && !item.downloadedAt ? (
                          <Button
                            className="w-fit"
                            disabled={downloadingItems[item.id]}
                            size="xs"
                            variant="form"
                            onClick={() =>
                              triggerProductDownload(item, order.id)
                            } // Use the hook's download function
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
                              date: new Date(
                                item.downloadedAt!,
                              ).toLocaleDateString(),
                            })}
                          </div>
                        )}
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
              {t("noDownloadsTitle")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t("noDownloadsMessage")}
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
