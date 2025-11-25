import { Injectable, NotFoundException } from "@nestjs/common";
import { TranscricaoRepository } from "../repositories/TranscricaoRepository";

@Injectable()
export class DeleteTranscricaoUseCase {
    constructor(
        private transcricaoRepository: TranscricaoRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const transcricao = await this.transcricaoRepository.findById(id);
        if (!transcricao) {
            throw new NotFoundException("Transcrição não encontrada.");
        }
        await this.transcricaoRepository.delete(id);
    }
}

