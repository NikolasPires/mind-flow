import { Injectable, NotFoundException } from "@nestjs/common";
import { PacienteRepository } from "../../repositories/PacienteRepository";
import { Gender, PatientStatus } from "generated/prisma";
import { PacienteViewModel } from "../../viewModel/PacienteViewModel";
type PacienteProfileResponse = {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  cpf: string | null;
  history: string | null;
  initial_observations: string | null;
  gender: string;
  status: string;
}

@Injectable()
export class GetPacienteProfileUseCase {
    constructor(
        // 1. Injeta APENAS o repositório
        private pacienteRepository: PacienteRepository,
    ) {}

    // O 'pacienteId' aqui é o 'userId'
    async execute(pacienteId: string): Promise<PacienteProfileResponse> {
        
        // 2. Chama um método do repositório que busca Paciente E User
        // (Vamos criar este método logo abaixo)
        const pacienteComUser = await this.pacienteRepository.findById(pacienteId); 
        
        if (!pacienteComUser) {
            throw new NotFoundException('Paciente não encontrado');
        }

        // 3. Os dados (pacienteComUser.cpf, .history, etc.)
        // já estão DESCRIPTOGRAFADOS graças ao Mapper.

        // 4. Retorna os dados formatados pelo ViewModel
        return PacienteViewModel.toHttp(pacienteComUser);
    }
}