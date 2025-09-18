-- CreateEnum
CREATE TYPE "public"."StockChangeType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "public"."StockHistory" (
    "id" SERIAL NOT NULL,
    "type" "public"."StockChangeType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "order_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productStockId" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_productStockId_fkey" FOREIGN KEY ("productStockId") REFERENCES "public"."ProductStocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
