/*
  Warnings:

  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeCheckoutSessionId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders"."Order" ADD COLUMN     "stripeCheckoutSessionId" TEXT NOT NULL,
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "orders"."Order"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Order_stripeCheckoutSessionId_idx" ON "orders"."Order"("stripeCheckoutSessionId");
