import { Consulta } from "../entities/Consulta";

export abstract class ConsultaRepository {
    abstract create(consulta: Consulta): Promise<void>;
    abstract findById(id: string): Promise<Consulta | null>;
    abstract findByPacienteId(paciente_id: string): Promise<Consulta[]>;
    abstract findAll(): Promise<Consulta[]>;
    abstract update(consulta: Consulta): Promise<void>;
    abstract delete(id: string): Promise<void>;
}

