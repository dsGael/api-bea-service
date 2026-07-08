// dto/crear-falla.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export class CrearFallaDto {
  @IsString()
  @MaxLength(80)
  nombre!: string;

  @IsOptional()
  @IsString()
  falla?: string;

  @IsOptional()
  @IsString()
  descripcionFalla?: string;

  @IsOptional()
  @IsString()
  idDispositivo?: string;
}


export class ActualizarFallaDto extends PartialType(CrearFallaDto) {}

