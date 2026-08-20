/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactName` to the `CustomRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `CustomRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RequestOccasion" AS ENUM ('WEDDING', 'BUSINESS', 'FUNERAL', 'CHURCH', 'OTHER');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productVariantId_fkey";

-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ADD COLUMN     "contactWhatsapp" TEXT,
ADD COLUMN     "occasion" "RequestOccasion",
ADD COLUMN     "productVariantId" TEXT,
ADD COLUMN     "size" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL;

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateIndex
CREATE INDEX "CustomRequest_productVariantId_idx" ON "CustomRequest"("productVariantId");

-- AddForeignKey
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
