-- AlterTable
ALTER TABLE "orders"."OrderItem" ADD COLUMN     "downloadedAt" TIMESTAMP(3),
ADD COLUMN     "downnloadCount" INTEGER NOT NULL DEFAULT 0;
