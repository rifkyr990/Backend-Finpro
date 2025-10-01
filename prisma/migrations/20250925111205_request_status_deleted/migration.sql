/*
  Warnings:

  - You are about to drop the `ApprovalRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_approverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_requesterId_fkey";

-- DropTable
DROP TABLE "public"."ApprovalRequest";

-- DropEnum
DROP TYPE "public"."ApprovalStatus";
