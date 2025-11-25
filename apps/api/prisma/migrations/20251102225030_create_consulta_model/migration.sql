-- CreateEnum
CREATE TYPE "ConsultaStatus" AS ENUM ('CONFIRMADO', 'CANCELADO', 'A_CONFIRMAR');

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "ConsultaStatus" NOT NULL DEFAULT 'A_CONFIRMAR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Paciente"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
