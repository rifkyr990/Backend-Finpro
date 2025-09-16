-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "store_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
