import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Transcricao, TranscricaoStatus } from "../entities/Transcricao";
import { TranscricaoRepository } from "../repositories/TranscricaoRepository";

interface CreateTranscricaoRequest {
    texto_gerado?: string;
    status?: TranscricaoStatus;
}

@Injectable()
export class CreateTranscricaoUseCase {
    constructor(
        private transcricaoRepository: TranscricaoRepository,
    ) {}

    async execute({ texto_gerado, status }: CreateTranscricaoRequest): Promise<Transcricao> {
        const transcricao = new Transcricao({
            id: randomUUID(),
            texto_gerado: texto_gerado ?? null,
            status: status ?? TranscricaoStatus.PENDENTE,
        });

        await this.transcricaoRepository.create(transcricao);

        return transcricao;
    }
}

