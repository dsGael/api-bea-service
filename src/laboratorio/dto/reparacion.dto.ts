import { IsString, IsOptional } from 'class-validator';

export class CrearReparacionDto {
  @IsString()
  id_dispositivo_t!: string;

  @IsOptional()
  @IsString()
  id_dispositivo?: string; // Si ya tiene un ID físico

  @IsOptional()
  @IsString()
  numero_serie?: string;

  @IsOptional()
  @IsString()
  id_tecnico_lab?: string; // A quién se lo asignan
}

export class ActualizarReparacionDto {
  @IsOptional()
  @IsString()
  estatus?: string; // 'EN PROCESO', 'REPARADO', 'SCRAP'

  @IsOptional()
  @IsString()
  notas_diagnostico?: string;

  // Las evidencias después las conectaremos con Multer/S3
  @IsOptional()
  @IsString()
  evidencia_1?: string;
}