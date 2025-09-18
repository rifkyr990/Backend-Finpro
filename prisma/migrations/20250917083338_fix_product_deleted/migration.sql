-- AlterTable
ALTER TABLE "public"."ArchivedStockHistory" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
