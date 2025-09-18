-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('MANUAL', 'MIN_PURCHASE', 'B1G1', 'FREE_ONGKIR');

-- CreateEnum
CREATE TYPE "public"."DiscountUsageStatus" AS ENUM ('APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReferralUsageStatus" AS ENUM ('PENDING', 'APPLIED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."Discount" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "store_id" INTEGER,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."DiscountType" NOT NULL,
    "isFreeShipping" BOOLEAN NOT NULL DEFAULT false,
    "minValue" DECIMAL(65,30),
    "minQty" INTEGER,
    "buyQty" INTEGER,
    "freeQty" INTEGER,
    "discAmount" DECIMAL(65,30),
    "maxUsage_perUser" INTEGER,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountUsage" (
    "id" SERIAL NOT NULL,
    "discount_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "public"."DiscountUsageStatus" NOT NULL,
    "useAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReferralUsage" (
    "id" SERIAL NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "reward_value" DECIMAL(65,30),
    "expiredAt" TIMESTAMP(3),
    "status" "public"."ReferralUsageStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referral_code_key" ON "public"."Referral"("referral_code");

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountUsage" ADD CONSTRAINT "DiscountUsage_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReferralUsage" ADD CONSTRAINT "ReferralUsage_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReferralUsage" ADD CONSTRAINT "ReferralUsage_referee_id_fkey" FOREIGN KEY ("referee_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
