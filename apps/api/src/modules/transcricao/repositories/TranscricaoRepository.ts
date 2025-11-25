import { Transcricao } from "../entities/Transcricao";

export abstract class TranscricaoRepository {
    abstract create(transcricao: Transcricao): Promise<void>;
    abstract findById(id: string): Promise<Transcricao | null>;
    abstract findAll(): Promise<Transcricao[]>;
    abstract update(transcricao: Transcricao): Promise<void>;
    abstract delete(id: string): Promise<void>;
}

