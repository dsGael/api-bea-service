import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';

export class CheckadaGpsDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class ChecarDto {

  @IsOptional()
  @IsUUID()
  idChecador?: string;

  @IsString()
  idUsuario!: string;

  @IsString()
  nombre!: string;

  @IsString()
  hora!: string; // formato "HH:mm:ss"

  @IsString()
  fecha_hora!: string; // ISO string completo

  @IsOptional()
  gps?: CheckadaGpsDto;

  @IsOptional()
  @IsString()
  deviceUUID?: string;
}


export class AjusteChecadaDto {
  @IsOptional()
  @IsString()
  HoraEntrada?: string; // Puedes enviarlo como Date ISO o String según lo manejes

  @IsOptional()
  @IsString()
  HoraSalida?: string;

  @IsOptional()
  @IsNumber()
  horasLaboradas?: number;

  @IsOptional()
  @IsString()
  Informativo?: string; // Aquí guardamos el motivo: "Ajuste manual por falla de app"
}

export class SyncChecadasDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecarDto)
  checadas!: ChecarDto[];
}