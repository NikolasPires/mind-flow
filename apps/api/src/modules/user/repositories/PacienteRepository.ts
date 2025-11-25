import { Paciente } from "../entities/Paciente";

export abstract class PacienteRepository {
    abstract findByCpfHash(cpfHash: string): Promise<Paciente | null>;
    abstract findByPsicologoId(psicologoId: string): Promise<(Paciente & { user: { name: string; email: string; photo_url: string | null } })[]>;
    abstract findById(userId: string): Promise<Paciente | null>;

}