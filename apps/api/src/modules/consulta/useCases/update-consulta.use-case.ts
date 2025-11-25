import { Injectable, NotFoundException } from "@nestjs/common";
import { Consulta, ConsultaStatus } from "../entities/Consulta";
import { ConsultaRepository } from "../repositories/ConsultaRepository";
import { PrismaService } from "src/database/prisma/prisma.service";

interface UpdateConsultaRequest {
    id: string;
    paciente_id?: string;
    horario?: Date;
    tipo?: string;
    categoria?: string;
    tags?: string[];
    status?: ConsultaStatus;
    sugestao_IA?: string;
    transcricao?: string;
    anotacoes?: string;
}

@Injectable()
export class UpdateConsultaUseCase {
    constructor(
        private consultaRepository: ConsultaRepository,
        private prisma: PrismaService,
    ) {}

    async execute({
        id,
        paciente_id,
        horario,
        tipo,
        categoria,
        tags,
        status,
        sugestao_IA,
        transcricao,
        anotacoes,
    }: UpdateConsultaRequest): Promise<Consulta> {
        // Buscar consulta existente
        const consultaExistente = await this.consultaRepository.findById(id);

        if (!consultaExistente) {
            throw new NotFoundException("Consulta não encontrada.");
        }

        // Se paciente_id foi fornecido, verificar se o paciente existe
        if (paciente_id) {
            const paciente = await this.prisma.paciente.findUnique({
                where: { userId: paciente_id },
            });

            if (!paciente) {
                throw new NotFoundException("Paciente não encontrado.");
            }
        }

        // Atualizar apenas os campos fornecidos
        if (paciente_id !== undefined) consultaExistente.paciente_id = paciente_id;
        if (horario !== undefined) consultaExistente.horario = horario;
        if (tipo !== undefined) consultaExistente.tipo = tipo;
        if (categoria !== undefined) consultaExistente.categoria = categoria;
        if (tags !== undefined) consultaExistente.tags = tags;
        if (status !== undefined) consultaExistente.status = status;
        if (sugestao_IA !== undefined) consultaExistente.sugestao_IA = sugestao_IA;
        if (transcricao !== undefined) consultaExistente.transcricao = transcricao;
        if (anotacoes !== undefined) consultaExistente.anotacoes = anotacoes;

        await this.consultaRepository.update(consultaExistente);

        return consultaExistente;
    }
}