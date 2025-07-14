/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `OTP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OTP_email_key" ON "OTP"("email");
