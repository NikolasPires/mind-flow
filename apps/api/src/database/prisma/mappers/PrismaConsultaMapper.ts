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
            transcricao_id: consulta.transcricao_id,
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
                sugestao_IA: (raw as any).sugestao_IA,
                transcricao_id: (raw as any).transcricao_id,
                created_at: raw.created_at,
                updatedAt: raw.updatedAt,
            }
        );
    }
}

