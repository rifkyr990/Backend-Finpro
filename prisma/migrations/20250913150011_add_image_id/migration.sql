/*
  Warnings:

  - You are about to drop the column `imageUrlPublicId` on the `User` table. All the data in the column will be lost.
  - Made the column `district` on table `UserAddress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "imageUrlPublicId",
ADD COLUMN     "image_id" TEXT;

-- AlterTable
ALTER TABLE "public"."UserAddress" ALTER COLUMN "district" SET NOT NULL;
