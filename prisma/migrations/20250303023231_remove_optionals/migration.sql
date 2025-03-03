/*
  Warnings:

  - Made the column `name` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alt_text` on table `ProductImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `ProductImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "products"."Product" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "products"."ProductImage" ALTER COLUMN "alt_text" SET NOT NULL,
ALTER COLUMN "url" SET NOT NULL;
