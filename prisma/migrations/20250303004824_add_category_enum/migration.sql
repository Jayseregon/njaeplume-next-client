/*
  Warnings:

  - The `category` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "products"."Category" AS ENUM ('brushes', 'stickers', 'templates', 'planners', 'freebies');

-- AlterTable
ALTER TABLE "products"."Product" DROP COLUMN "category",
ADD COLUMN     "category" "products"."Category";
