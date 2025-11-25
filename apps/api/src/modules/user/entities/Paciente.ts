import { Replace } from "src/utils/Replace";

export enum Gender {
    MASCULINO = 'MASCULINO',
    FEMININO = 'FEMININO',
    OUTRO = 'OUTRO',
}

export enum PatientStatus {
    ATIVO = 'ATIVO',
    ACOMPANHAMENTO = 'ACOMPANHAMENTO',
    ALTA = 'ALTA',
    INATIVO = 'INATIVO',
}

interface PacienteSchema {
    userId: string; 
    cpf: string | null;
    cpfHash: string | null;
    gender: Gender;
    initial_observations: string | null;
    history: string | null;
    status: PatientStatus;
    psicologo_responsavel_id: string | null;
}

export class Paciente {
    private props: PacienteSchema;

    constructor(
        props: Replace<
            PacienteSchema, 
            { 
                cpf?: string | null, 
                cpfHash?: string | null,
                initial_observations?: string | null,
                history?: string | null,
                status?: PatientStatus,
                psicologo_responsavel_id?: string | null
            }
        >
    ) {
        this.props = {
            ...props,
            cpf: props.cpf ?? null,
            cpfHash: props.cpfHash ?? null,
            initial_observations: props.initial_observations ?? null,
            history: props.history ?? null,
            status: props.status ?? PatientStatus.ATIVO,
            psicologo_responsavel_id: props.psicologo_responsavel_id ?? null,
        }
    }

    get userId(): string { return this.props.userId; }
    
    get cpf(): string | null { return this.props.cpf; }
    set cpf(cpf: string | null) { this.props.cpf = cpf; }

    get cpfHash(): string | null { return this.props.cpfHash; }

    get gender(): Gender { return this.props.gender; }
    set gender(gender: Gender) { this.props.gender = gender; }

    get initial_observations(): string | null { return this.props.initial_observations; }
    set initial_observations(text: string | null) { this.props.initial_observations = text; }

    get history(): string | null { return this.props.history; }
    set history(text: string | null) { this.props.history = text; }

    get status(): PatientStatus { return this.props.status; }
    set status(status: PatientStatus) { this.props.status = status; }

    get psicologo_responsavel_id(): string | null { return this.props.psicologo_responsavel_id; }
    set psicologo_responsavel_id(id: string | null) { this.props.psicologo_responsavel_id = id; }
}