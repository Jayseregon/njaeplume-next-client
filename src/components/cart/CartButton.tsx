"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/providers/CartStoreProvider";

interface CartButtonProps {
  className?: string;
  nonce?: string;
}

export function CartButton({ className, nonce }: CartButtonProps) {
  // Track hydration status
  const [isHydrated, setIsHydrated] = useState(false);

  // Get cart state directly - this will re-render when items change
  const toggleCart = useCartStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  const itemsCount = items.length;

  // Set hydrated state once component mounts on client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
      {/* Only show the badge after hydration */}
      {isHydrated && itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {itemsCount}
        </span>
      )}
    </Button>
  );
}
