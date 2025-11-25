/*
  Warnings:

  - You are about to drop the column `transcricao_id` on the `Consulta` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ConsultaStatus" ADD VALUE 'CONCLUIDA';

-- AlterTable
ALTER TABLE "Consulta" DROP COLUMN "transcricao_id",
ADD COLUMN     "anotacoes" TEXT,
ADD COLUMN     "transcricao" TEXT;
