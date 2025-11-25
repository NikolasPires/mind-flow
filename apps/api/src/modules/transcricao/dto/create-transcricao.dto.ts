import { IsOptional, IsString, IsEnum } from "class-validator";
import { TranscricaoStatus } from "../entities/Transcricao";

export class CreateTranscricaoBody {
    @IsOptional()
    @IsString()
    texto_gerado?: string;

    @IsOptional()
    @IsEnum(TranscricaoStatus)
    status?: TranscricaoStatus;
}

