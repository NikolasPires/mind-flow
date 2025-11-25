import { Replace } from "src/utils/Replace";

export enum ConsultaStatus {
    CONFIRMADO = 'CONFIRMADO',
    CANCELADO = 'CANCELADO',
    A_CONFIRMAR = 'A_CONFIRMAR',
}

interface ConsultaSchema {
    id: string;
    paciente_id: string;
    horario: Date;
    tipo: string;
    categoria: string;
    tags: string[];
    status: ConsultaStatus;
    sugestao_IA?: string | null;
    transcricao_id?: string | null;
    created_at: Date;
    updatedAt: Date;
}

export class Consulta {
    private props: ConsultaSchema;

    constructor(
        props: Replace<
            ConsultaSchema,
            {
                created_at?: Date;
                updatedAt?: Date;
            }
        >
    ) {
        this.props = {
            ...props,
            created_at: props.created_at ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    get id(): string {
        return this.props.id;
    }

    get paciente_id(): string {
        return this.props.paciente_id;
    }
    set paciente_id(paciente_id: string) {
        this.props.paciente_id = paciente_id;
    }

    get horario(): Date {
        return this.props.horario;
    }
    set horario(horario: Date) {
        this.props.horario = horario;
    }

    get tipo(): string {
        return this.props.tipo;
    }
    set tipo(tipo: string) {
        this.props.tipo = tipo;
    }

    get categoria(): string {
        return this.props.categoria;
    }
    set categoria(categoria: string) {
        this.props.categoria = categoria;
    }

    get tags(): string[] {
        return this.props.tags;
    }
    set tags(tags: string[]) {
        this.props.tags = tags;
    }

    get status(): ConsultaStatus {
        return this.props.status;
    }
    set status(status: ConsultaStatus) {
        this.props.status = status;
    }

    get created_at(): Date {
        return this.props.created_at;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get sugestao_IA(): string | null | undefined {
        return this.props.sugestao_IA;
    }
    set sugestao_IA(sugestao_IA: string | null | undefined) {
        this.props.sugestao_IA = sugestao_IA;
    }

    get transcricao_id(): string | null | undefined {
        return this.props.transcricao_id;
    }
    set transcricao_id(transcricao_id: string | null | undefined) {
        this.props.transcricao_id = transcricao_id;
    }
}

