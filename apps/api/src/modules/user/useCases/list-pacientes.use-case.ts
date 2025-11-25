import { Injectable, ForbiddenException } from "@nestjs/common";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { PrismaService } from "src/database/prisma/prisma.service";

interface ListPacientesRequest {
    psicologoId: string;
}

@Injectable()
export class ListPacientesUseCase {
    constructor(
        private pacienteRepository: PacienteRepository,
        private prisma: PrismaService,
    ) {}

    async execute({ psicologoId }: ListPacientesRequest) {
        // Verificar se o psicólogo existe
        const psicologo = await this.prisma.psicologo.findUnique({
            where: { userId: psicologoId },
        });

        if (!psicologo) {
            throw new ForbiddenException("Usuário não é um psicólogo ou não foi encontrado.");
        }

        // Buscar pacientes do psicólogo
        const pacientes = await this.pacienteRepository.findByPsicologoId(psicologoId);

        return pacientes;
    }
}

