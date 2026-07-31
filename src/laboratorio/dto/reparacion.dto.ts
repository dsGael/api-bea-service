import { IsString, IsOptional, IsIn } from 'class-validator';

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
  @IsIn(['Pendiente', 'Reparado', 'SINIESTRADO'])
  estatus?: string; // 'EN PROCESO', 'REPARADO', 'SCRAP'

  @IsOptional()
  @IsString()
  notas_diagnostico?: string;


}