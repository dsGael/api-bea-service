// dto/crear-almacen.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export class CrearAlmacenDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  responsable?: string;
}


export class ActualizarAlmacenDto extends PartialType(CrearAlmacenDto) {}