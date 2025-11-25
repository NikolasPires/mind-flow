/*
  Warnings:

  - You are about to drop the column `id_consulta` on the `Transcricao` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Transcricao" DROP CONSTRAINT "Transcricao_id_consulta_fkey";

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "transcricao_id" TEXT;

-- AlterTable
ALTER TABLE "Transcricao" DROP COLUMN "id_consulta";
