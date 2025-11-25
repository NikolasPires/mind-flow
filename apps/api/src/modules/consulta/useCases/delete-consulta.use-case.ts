import { Injectable, NotFoundException } from "@nestjs/common";
import { ConsultaRepository } from "../repositories/ConsultaRepository";

@Injectable()
export class DeleteConsultaUseCase {
    constructor(
        private consultaRepository: ConsultaRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const consulta = await this.consultaRepository.findById(id);

        if (!consulta) {
            throw new NotFoundException("Consulta não encontrada.");
        }

        await this.consultaRepository.delete(id);
    }
}

