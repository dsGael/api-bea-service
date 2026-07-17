import { IsString, IsOptional, IsNumber, Min, IsIn } from 'class-validator';

export class CrearSolicitudDto {
  @IsOptional()
  @IsString()
  idticket?: string; // opcional — puede solicitarse sin estar ligado a un folio específico

  @IsString()
  idDispositivo!: string; // idDispositivoT — tipo de refacción/pieza

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  cantidad?: number = 1;

  @IsOptional()
  @IsString()
  imagen?: string; // URL de MinIO, opcional — foto de la pieza dañada
}


export class ActualizarEstadoSolicitudDto {
  @IsIn(['aprobada', 'rechazada', 'entregada'])
  estado!: 'aprobada' | 'rechazada' | 'entregada';

  // Solo requerido cuando estado = 'entregada' — de dónde sale la pieza
  @IsOptional()
  @IsString()
  idAlmacen?: string;
}