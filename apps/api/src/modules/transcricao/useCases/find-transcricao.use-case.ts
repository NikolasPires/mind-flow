import { Injectable, NotFoundException } from "@nestjs/common";
import { Transcricao } from "../entities/Transcricao";
import { TranscricaoRepository } from "../repositories/TranscricaoRepository";

@Injectable()
export class FindTranscricaoUseCase {
    constructor(
        private transcricaoRepository: TranscricaoRepository,
    ) {}

    async execute(id: string): Promise<Transcricao> {
        const transcricao = await this.transcricaoRepository.findById(id);

        if (!transcricao) {
            throw new NotFoundException("Transcrição não encontrada.");
        }

        return transcricao;
    }
}

