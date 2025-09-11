/*
  Warnings:

  - You are about to drop the `Admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Admins" DROP CONSTRAINT "Admins_store_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Admins" DROP CONSTRAINT "Admins_user_id_fkey";

-- DropTable
DROP TABLE "public"."Admins";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
