import { Consulta as PrismaConsulta } from "generated/prisma";
import { Consulta, ConsultaStatus } from "src/modules/consulta/entities/Consulta";

export class PrismaConsultaMapper {
    static toPrisma(consulta: Consulta) {
        return {
            id: consulta.id,
            paciente_id: consulta.paciente_id,
            horario: consulta.horario,
            tipo: consulta.tipo,
            categoria: consulta.categoria,
            tags: consulta.tags,
            status: consulta.status,
            sugestao_IA: consulta.sugestao_IA,
            transcricao: consulta.transcricao,
            anotacoes: consulta.anotacoes,
            created_at: consulta.created_at,
            updatedAt: consulta.updatedAt,
        };
    }

    static toDomain(raw: PrismaConsulta): Consulta {
        return new Consulta(
            {
                id: raw.id,
                paciente_id: raw.paciente_id,
                horario: raw.horario,
                tipo: raw.tipo,
                categoria: raw.categoria,
                tags: raw.tags,
                status: raw.status as ConsultaStatus,
                sugestao_IA: raw.sugestao_IA,
                transcricao: (raw as any).transcricao,
                anotacoes: (raw as any).anotacoes,
                created_at: raw.created_at,
                updatedAt: raw.updatedAt,
            }
        );
    }
}

