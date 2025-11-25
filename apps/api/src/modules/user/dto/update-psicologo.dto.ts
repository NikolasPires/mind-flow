import { IsOptional, IsString } from "class-validator";

export class UpdatePsicologoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  schedule_settings?: any;
}

