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
import { OrdersTable } from "@/src/components/account/OrdersTable";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/src/actions/prisma/action";
import { OrderWithItems } from "@/interfaces/Products";

export default function OrdersPage() {
  const t = useTranslations("AccountOrders");
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          toast.error(t("errorLoading"));
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
  }, [user, isLoaded, t]);

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
          <OrdersTable orders={orders} />
        ) : (
          <div className="border rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">{t("noOrdersTitle")}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t("noOrdersMessage")}
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
