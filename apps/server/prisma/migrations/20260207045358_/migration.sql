-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accessTokenExpiry" SET DEFAULT NOW() + INTERVAL '1 hour';
