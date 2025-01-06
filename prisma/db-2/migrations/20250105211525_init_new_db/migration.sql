-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "products";

-- CreateTable
CREATE TABLE "products"."Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "old_sku" TEXT,
    "name" TEXT,
    "old_name" TEXT,
    "old_price" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "old_description" TEXT,
    "details" TEXT,
    "old_details" TEXT,
    "category" TEXT,
    "old_category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_date_created" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "old_date_updated" TIMESTAMP(3),
    "zip_file_name" TEXT,
    "old_zip_file_name" TEXT,
    "slug" TEXT,
    "old_slug" TEXT,
    "old_tags" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products"."ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "old_alt_text" TEXT,
    "alt_text" TEXT,
    "url" TEXT NOT NULL,
    "old_url" TEXT,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "products"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
