-- DropForeignKey
ALTER TABLE "public"."DiscountUsage" DROP CONSTRAINT "DiscountUsage_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountUsage" DROP CONSTRAINT "DiscountUsage_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountUsage" DROP CONSTRAINT "DiscountUsage_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
