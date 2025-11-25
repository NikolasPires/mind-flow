import { Paciente } from "../entities/Paciente";

export class PacienteViewModel {
    static toHttp(paciente: Paciente & { user?: { name: string; email: string; photo_url: string | null }; userId?: string }) {
        const userId = (paciente as any).userId || paciente.userId;
        
        return {
            id: userId,
            name: paciente.user?.name || '',
            email: paciente.user?.email || '',
            photo_url: paciente.user?.photo_url || null,
            cpf: paciente.cpf,
            gender: paciente.gender,
            initial_observations: paciente.initial_observations,
            history: paciente.history,
            status: paciente.status,
            psicologo_responsavel_id: paciente.psicologo_responsavel_id,
        };
    }

    static toHttpList(pacientes: (Paciente & { user: { name: string; email: string; photo_url: string | null } })[]) {
        return pacientes.map(this.toHttp);
    }
}

