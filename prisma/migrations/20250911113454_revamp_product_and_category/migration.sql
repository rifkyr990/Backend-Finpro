/*
  Warnings:

  - Made the column `category_id` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "category_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
