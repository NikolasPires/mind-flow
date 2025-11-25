import { Module } from "@nestjs/common";
import { PacienteController } from "./paciente.controller";
import { PacienteService } from "./paciente.service";
import { PrismaService } from "src/database/prisma/prisma.service";
import { EncryptionService } from "src/modules/services/encryptionService";

@Module({
  controllers: [PacienteController],
  providers: [
    PacienteService,
    PrismaService,
    EncryptionService, 
  ],
  exports: [PacienteService],
})
export class PacienteModule {}
