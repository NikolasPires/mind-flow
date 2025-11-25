import { IsString, IsDateString, IsArray, IsOptional, IsEnum } from "class-validator";
import { ConsultaStatus } from "../entities/Consulta";

export class UpdateConsultaBody {
    @IsOptional()
    @IsString()
    paciente_id?: string;

    @IsOptional()
    @IsDateString()
    horario?: string;

    @IsOptional()
    @IsString()
    tipo?: string;

    @IsOptional()
    @IsString()
    categoria?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

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