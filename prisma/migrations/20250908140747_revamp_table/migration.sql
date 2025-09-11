-- DropForeignKey
ALTER TABLE "public"."Admins" DROP CONSTRAINT "Admins_store_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Admins" DROP CONSTRAINT "Admins_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."Admins" ADD CONSTRAINT "Admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admins" ADD CONSTRAINT "Admins_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
