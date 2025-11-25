import { IsOptional, IsString, IsEnum } from "class-validator";
import { PatientStatus } from "../../../../generated/prisma";


export class UpdatePacienteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  initial_observations?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}
