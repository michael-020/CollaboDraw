-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('GOOGLE', 'CREDENTIALS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'CREDENTIALS',
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
