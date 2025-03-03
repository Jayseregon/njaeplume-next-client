/*
  Warnings:

  - You are about to drop the column `old_category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_date_created` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_date_updated` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_slug` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_tags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_zip_file_name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `old_alt_text` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `old_url` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products"."Product" DROP COLUMN "old_category",
DROP COLUMN "old_date_created",
DROP COLUMN "old_date_updated",
DROP COLUMN "old_description",
DROP COLUMN "old_name",
DROP COLUMN "old_price",
DROP COLUMN "old_slug",
DROP COLUMN "old_tags",
DROP COLUMN "old_zip_file_name";

-- AlterTable
ALTER TABLE "products"."ProductImage" DROP COLUMN "old_alt_text",
DROP COLUMN "old_url";
