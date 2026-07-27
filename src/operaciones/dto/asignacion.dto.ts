import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CrearAsignacionDto {
  @IsOptional()
  @IsInt()
  FOLIO?: number;

  @IsDateString()
  FECHA!: string;

  @IsOptional()
  @IsInt()
  LINEA?: number;

  @IsOptional()
  @IsInt()
  JORNADA?: number;

  @IsString()
  UNIDAD!: string;

  @IsString()
  OPERADOR!: string;

  @IsString()
  NOMBRE_COMPLETO!: string;

  @IsDateString()
  HORA_SALIDA!: string;
}