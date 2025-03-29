"use client";

import { Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import Image from "next/image";

import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setCartOpen,
    removeFromCart,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            My Cart
          </SheetTitle>
          <SheetDescription className="text-sm italic text-muted-foreground">
            Make sure to review your cart before checkout
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-center">
              Your cart is empty
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="flex flex-col gap-5 py-4">
                {items.map((product) => (
                  <div key={product.id} className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
                      {product.images.length > 0 && (
                        <Image
                          alt={product.images[0].alt_text}
                          className="h-full w-full object-cover"
                          height={80}
                          src={product.images[0].url}
                          width={80}
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category.charAt(0).toUpperCase() +
                            product.category.slice(1)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {formatPrice(product.price)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="border-t pt-4">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="outline"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
