-- CreateTable
CREATE TABLE "public"."ProductStocks" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductStocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductStocks_store_id_product_id_key" ON "public"."ProductStocks"("store_id", "product_id");

-- AddForeignKey
ALTER TABLE "public"."ProductStocks" ADD CONSTRAINT "ProductStocks_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductStocks" ADD CONSTRAINT "ProductStocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
