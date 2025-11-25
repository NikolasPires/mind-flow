import { Consulta } from "../entities/Consulta";

export class ConsultaViewModel {
    static toHttp(consulta: Consulta) {
        // Garantir que as datas sejam objetos Date válidos
        // Se for undefined/null, usar a data atual como fallback
        const horario = consulta.horario 
            ? (consulta.horario instanceof Date ? consulta.horario : new Date(consulta.horario))
            : new Date();
        const created_at = consulta.created_at 
            ? (consulta.created_at instanceof Date ? consulta.created_at : new Date(consulta.created_at))
            : new Date();
        const updatedAt = consulta.updatedAt 
            ? (consulta.updatedAt instanceof Date ? consulta.updatedAt : new Date(consulta.updatedAt))
            : new Date();

        return {
            id: consulta.id,
            paciente_id: consulta.paciente_id,
            horario: horario.toISOString(),
            tipo: consulta.tipo,
            categoria: consulta.categoria,
            tags: consulta.tags,
            status: consulta.status,
            sugestao_IA: consulta.sugestao_IA,
            transcricao_id: consulta.transcricao_id,
            created_at: created_at.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }

    static toHttpWithPaciente(consulta: Consulta & { paciente?: { user: { name: string } } }) {
        // Garantir que as datas sejam objetos Date válidos
        // Se for undefined/null, usar a data atual como fallback
        const horario = consulta.horario 
            ? (consulta.horario instanceof Date ? consulta.horario : new Date(consulta.horario))
            : new Date();
        const created_at = consulta.created_at 
            ? (consulta.created_at instanceof Date ? consulta.created_at : new Date(consulta.created_at))
            : new Date();
        const updatedAt = consulta.updatedAt 
            ? (consulta.updatedAt instanceof Date ? consulta.updatedAt : new Date(consulta.updatedAt))
            : new Date();

        const consultaData: any = consulta;
        const transcricaoData = consultaData.transcricao;

        return {
            id: consulta.id,
            paciente_id: consulta.paciente_id,
            paciente: consulta.paciente ? {
                name: consulta.paciente.user.name,
            } : null,
            horario: horario.toISOString(),
            tipo: consulta.tipo,
            categoria: consulta.categoria,
            tags: consulta.tags,
            status: consulta.status,
            sugestao_IA: consulta.sugestao_IA,
            transcricao_id: consulta.transcricao_id,
            created_at: created_at.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    }
}

