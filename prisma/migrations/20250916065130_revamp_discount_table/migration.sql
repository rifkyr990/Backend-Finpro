/*
  Warnings:

  - You are about to drop the column `buyQty` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `expiredAt` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `isFreeShipping` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `maxUsage_perUser` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `minValue` on the `Discount` table. All the data in the column will be lost.
  - Added the required column `end_date` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "buyQty",
DROP COLUMN "expiredAt",
DROP COLUMN "isFreeShipping",
DROP COLUMN "maxUsage_perUser",
DROP COLUMN "minValue",
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "minPurch" DECIMAL(65,30),
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;
