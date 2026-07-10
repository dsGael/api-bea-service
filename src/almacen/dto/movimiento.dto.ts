import { IsString, IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class RegistrarMovimientoDto {
  @IsIn(['entrada', 'salida', 'traspaso', 'asignacion'])
  tipoMovimiento!: 'entrada' | 'salida' | 'traspaso' | 'asignacion';

  @IsString()
  idDispositivo!: string; // idDispositivoT — tipo de dispositivo, no unidad

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  idAlmacenOrigen?: string; // requerido para salida/traspaso/asignacion

  @IsOptional()
  @IsString()
  idAlmacenDestino?: string; // requerido para entrada/traspaso

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  comentario?: string;
}