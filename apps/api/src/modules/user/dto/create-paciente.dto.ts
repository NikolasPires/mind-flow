import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";
import { Gender } from "../entities/Paciente"; 

export class CreatePacienteBody {
    @IsNotEmpty() @IsString() name: string;
    
    @IsEmail() email: string;
    
    @MinLength(6) password: string;

    @IsString() cpf: string;
    
    @IsNotEmpty() @IsEnum(Gender) gender: Gender;

    // --- ALTERAÇÃO AQUI: Campo adicionado ---
    @IsOptional()
    @IsString()
    phone?: string;
}