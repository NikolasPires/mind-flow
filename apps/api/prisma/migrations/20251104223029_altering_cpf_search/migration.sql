/*
  Warnings:

  - A unique constraint covering the columns `[cpfHash]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "cpfHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_cpfHash_key" ON "Paciente"("cpfHash");
