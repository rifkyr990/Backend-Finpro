/*
  Warnings:

  - You are about to drop the column `address_line` on the `UserAddress` table. All the data in the column will be lost.
  - Added the required column `district` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `UserAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."UserAddress" DROP COLUMN "address_line",
ADD COLUMN     "detail" TEXT,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL;
