import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Consulta, ConsultaStatus } from "../entities/Consulta";
import { ConsultaRepository } from "../repositories/ConsultaRepository";
import { PrismaService } from "src/database/prisma/prisma.service";

interface CreateConsultaRequest {
    paciente_id: string;
    horario: Date;
    tipo: string;
    categoria: string;
    tags: string[];
    status?: ConsultaStatus;
    sugestao_IA?: string;
    transcricao_id?: string;
}

@Injectable()
export class CreateConsultaUseCase {
    constructor(
        private consultaRepository: ConsultaRepository,
        private prisma: PrismaService,
    ) {}

    async execute({ paciente_id, horario, tipo, categoria, tags, status, sugestao_IA, transcricao_id }: CreateConsultaRequest): Promise<Consulta> {
        // Verificar se o paciente existe
        const paciente = await this.prisma.paciente.findUnique({
            where: { userId: paciente_id },
        });

        if (!paciente) {
            throw new NotFoundException("Paciente não encontrado.");
        }

        const consulta = new Consulta({
            id: randomUUID(),
            paciente_id,
            horario,
            tipo,
            categoria,
            tags,
            status: status ?? ConsultaStatus.A_CONFIRMAR,
            sugestao_IA,
            transcricao_id,
        });

        await this.consultaRepository.create(consulta);

        return consulta;
    }
}