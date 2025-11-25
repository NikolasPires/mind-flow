// repositories/PrismaTranscricaoRepository.ts

import { Injectable } from "@nestjs/common";
import { Transcricao } from "src/modules/transcricao/entities/Transcricao";
import { TranscricaoRepository } from "src/modules/transcricao/repositories/TranscricaoRepository";
import { PrismaService } from "../prisma.service";
import { PrismaTranscricaoMapper } from "../mappers/PrismaTranscricaoMapper"; // 1. O import já existe

@Injectable()
export class PrismaTranscricaoRepository implements TranscricaoRepository {
    constructor(
        private prisma: PrismaService,
        private mapper: PrismaTranscricaoMapper
    ) {}

    async create(transcricao: Transcricao): Promise<void> {
        const transcricaoRaw = this.mapper.toPrisma(transcricao); 
        await this.prisma.transcricao.create({
            data: transcricaoRaw,
        });
    }

    async findById(id: string): Promise<Transcricao | null> {
        const transcricao = await this.prisma.transcricao.findUnique({
            where: { id },
        });

        if (!transcricao) return null;
        return this.mapper.toDomain(transcricao);
    }

    async findAll(): Promise<Transcricao[]> {
        const transcricoes = await this.prisma.transcricao.findMany({
            orderBy: { created_at: 'desc' },
        });
        return transcricoes.map((t) => this.mapper.toDomain(t));
    }

    async update(transcricao: Transcricao): Promise<void> {
        const transcricaoRaw = this.mapper.toPrisma(transcricao);
        await this.prisma.transcricao.update({
            where: { id: transcricao.id },
            data: {
                texto_gerado: transcricaoRaw.texto_gerado,
                data_geracao: transcricaoRaw.data_geracao,
                status: transcricaoRaw.status,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.transcricao.delete({
            where: { id },
        });
    }
}