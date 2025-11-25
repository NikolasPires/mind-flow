-- CreateEnum
CREATE TYPE "TranscricaoStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDA', 'ERRO');

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "sugestao_IA" TEXT;

-- CreateTable
CREATE TABLE "Transcricao" (
    "id" TEXT NOT NULL,
    "id_consulta" TEXT NOT NULL,
    "texto_gerado" TEXT,
    "data_geracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TranscricaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcricao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcricao_id_consulta_key" ON "Transcricao"("id_consulta");

-- AddForeignKey
ALTER TABLE "Transcricao" ADD CONSTRAINT "Transcricao_id_consulta_fkey" FOREIGN KEY ("id_consulta") REFERENCES "Consulta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
