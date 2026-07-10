import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CheckadaGpsDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class ChecarDto {
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