import { Injectable, NotFoundException } from "@nestjs/common";
import { Transcricao, TranscricaoStatus } from "../entities/Transcricao";
import { TranscricaoRepository } from "../repositories/TranscricaoRepository";

interface UpdateTranscricaoRequest {
    id: string;
    texto_gerado?: string;
    status?: TranscricaoStatus;
}

@Injectable()
export class UpdateTranscricaoUseCase {
    constructor(
        private transcricaoRepository: TranscricaoRepository,
    ) {}

    async execute({ id, texto_gerado, status }: UpdateTranscricaoRequest): Promise<Transcricao> {
        const transcricaoExistente = await this.transcricaoRepository.findById(id);

        if (!transcricaoExistente) {
            throw new NotFoundException("Transcrição não encontrada.");
        }

        // Atualizar apenas os campos fornecidos
        if (texto_gerado !== undefined) transcricaoExistente.texto_gerado = texto_gerado;
        if (status !== undefined) transcricaoExistente.status = status;

        await this.transcricaoRepository.update(transcricaoExistente);

        return transcricaoExistente;
    }
}

