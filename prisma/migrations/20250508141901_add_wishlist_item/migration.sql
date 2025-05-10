-- CreateTable
CREATE TABLE "products"."WishlistItem" (
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("userId","productId")
);

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "products"."WishlistItem"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "products"."WishlistItem"("productId");

-- AddForeignKey
ALTER TABLE "products"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
