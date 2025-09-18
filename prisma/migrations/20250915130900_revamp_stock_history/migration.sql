/*
  Warnings:

  - Added the required column `updated_stock` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StockHistory" ADD COLUMN     "updated_stock" INTEGER NOT NULL;
