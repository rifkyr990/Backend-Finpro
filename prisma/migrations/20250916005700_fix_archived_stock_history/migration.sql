-- DropForeignKey
ALTER TABLE "public"."ArchivedStockHistory" DROP CONSTRAINT "ArchivedStockHistory_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."ArchivedStockHistory" ADD CONSTRAINT "ArchivedStockHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
