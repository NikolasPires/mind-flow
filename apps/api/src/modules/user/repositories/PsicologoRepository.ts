import { Psicologo } from "../entities/Psicologo";

export abstract class PsicologoRepository {
    abstract findByCrpHash(crp: string): Promise<Psicologo | null>;
}