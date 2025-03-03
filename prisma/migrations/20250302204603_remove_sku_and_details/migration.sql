/*
  Warnings:

  - You are about to drop the column `details` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_details` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products"."Product" DROP COLUMN "details",
DROP COLUMN "old_details",
DROP COLUMN "old_sku",
DROP COLUMN "sku";
