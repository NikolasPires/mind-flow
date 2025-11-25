import { Injectable } from "@nestjs/common";
import { Transcricao } from "../entities/Transcricao";
import { TranscricaoRepository } from "../repositories/TranscricaoRepository";

@Injectable()
export class ListTranscricoesUseCase {
    constructor(
        private transcricaoRepository: TranscricaoRepository,
    ) {}

    async execute(): Promise<Transcricao[]> {
        return await this.transcricaoRepository.findAll();
    }
}

