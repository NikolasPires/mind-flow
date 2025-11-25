import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsEnum } from "class-validator";
import { ConsultaStatus } from "../entities/Consulta";

export class CreateConsultaBody {
    @IsNotEmpty()
    @IsString()
    paciente_id: string;

    @IsNotEmpty()
    @IsDateString()
    horario: string;

    @IsNotEmpty()
    @IsString()
    tipo: string;

    @IsNotEmpty()
    @IsString()
    categoria: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsOptional()
    @IsEnum(ConsultaStatus)
    status?: ConsultaStatus;

    @IsOptional()
    @IsString()
    sugestao_IA?: string;


    @IsOptional()
    @IsString()
    transcricao?: string;

    @IsOptional()
    @IsString()
    anotacoes?: string;
}

