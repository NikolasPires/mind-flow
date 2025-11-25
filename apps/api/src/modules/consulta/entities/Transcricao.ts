export enum TranscricaoStatus {
    PENDENTE = 'PENDENTE',
    PROCESSANDO = 'PROCESSANDO',
    CONCLUIDA = 'CONCLUIDA',
    ERRO = 'ERRO',
}

interface TranscricaoSchema {
    id: string;
    texto_gerado: string | null;
    data_geracao: Date;
    status: TranscricaoStatus;
    created_at: Date;
    updatedAt: Date;
}

export class Transcricao {
    private props: TranscricaoSchema;

    constructor(
        props: {
            id: string;
            texto_gerado?: string | null;
            data_geracao?: Date;
            status?: TranscricaoStatus;
            created_at?: Date;
            updatedAt?: Date;
        }
    ) {
        this.props = {
            ...props,
            texto_gerado: props.texto_gerado ?? null,
            data_geracao: props.data_geracao ?? new Date(),
            status: props.status ?? TranscricaoStatus.PENDENTE,
            created_at: props.created_at ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    get id(): string {
        return this.props.id;
    }

    get texto_gerado(): string | null {
        return this.props.texto_gerado;
    }
    set texto_gerado(texto_gerado: string | null) {
        this.props.texto_gerado = texto_gerado;
    }

    get data_geracao(): Date {
        return this.props.data_geracao;
    }
    set data_geracao(data_geracao: Date) {
        this.props.data_geracao = data_geracao;
    }

    get status(): TranscricaoStatus {
        return this.props.status;
    }
    set status(status: TranscricaoStatus) {
        this.props.status = status;
    }

    get created_at(): Date {
        return this.props.created_at;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
