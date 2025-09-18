/*
  Warnings:

  - Added the required column `valueType` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ValueType" AS ENUM ('NOMINAL', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "valueType" "public"."ValueType" NOT NULL;
