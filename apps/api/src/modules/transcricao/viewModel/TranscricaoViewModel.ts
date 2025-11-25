import { Transcricao } from "../entities/Transcricao";

export class TranscricaoViewModel {
    static toHttp(transcricao: Transcricao) {
        // Garantir que as datas sejam objetos Date válidos
        const data_geracao = transcricao.data_geracao 
            ? (transcricao.data_geracao instanceof Date ? transcricao.data_geracao : new Date(transcricao.data_geracao))
            : new Date();
        const created_at = transcricao.created_at 
            ? (transcricao.created_at instanceof Date ? transcricao.created_at : new Date(transcricao.created_at))
            : new Date();
        const updatedAt = transcricao.updatedAt 
            ? (transcricao.updatedAt instanceof Date ? transcricao.updatedAt : new Date(transcricao.updatedAt))
            : new Date();

        return {
            id: transcricao.id,
            texto_gerado: transcricao.texto_gerado,
            data_geracao: data_geracao.toISOString(),
            status: transcricao.status,
            created_at: created_at.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }
}

