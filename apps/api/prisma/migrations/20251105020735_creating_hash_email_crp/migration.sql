/*
  Warnings:

  - A unique constraint covering the columns `[crpHash]` on the table `Psicologo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Psicologo" ADD COLUMN     "crpHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Psicologo_crpHash_key" ON "Psicologo"("crpHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "User"("emailHash");
