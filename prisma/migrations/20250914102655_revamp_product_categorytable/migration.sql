/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_category_key" ON "public"."ProductCategory"("category");
