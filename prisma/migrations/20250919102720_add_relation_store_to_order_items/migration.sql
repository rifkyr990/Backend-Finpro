/*
  Warnings:

  - Added the required column `store_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "store_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
