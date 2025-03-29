"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  nonce?: string;
}

export function CartButton({ className, nonce }: CartButtonProps) {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const itemsCount = useCartStore((state) => state.getItemsCount());

  return (
    <Button
      aria-label="Open cart"
      className={cn("relative", className)}
      nonce={nonce}
      size="icon"
      variant="ghost"
      onClick={toggleCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {itemsCount}
        </span>
      )}
    </Button>
  );
}
