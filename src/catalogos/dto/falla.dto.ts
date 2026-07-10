// dto/crear-falla.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';



export class FallaResponseDto {
  id!: string;
  idDispositivo!: string | null;
  nombre!: string;
  falla!: string | null;
  descripcion!: string | null;
  creadoPor!: string | null;
  fechaCreacion!: Date | null;
  modificadoPor!: string | null;
  fechaModificacion!: Date | null;

  static fromPrisma(falla: any): FallaResponseDto {
    return {
      id: falla.idFalla,
      idDispositivo: falla.idDispositivo,
      nombre: falla.nombre,
      falla: falla.falla,
      descripcion: falla.descripcionFalla,
      creadoPor: falla.creadoPor,
      fechaCreacion: falla.fechaCreacion,
      modificadoPor: falla.modificadoPor,
      fechaModificacion: falla.fechaModificacion,
    };
  }
}


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

