import { IsString, IsOptional, IsNumber, Min, IsIn, IsArray } from 'class-validator';

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
  @IsArray()
  @IsString({ each: true, message: 'Cada elemento dentro del arreglo debe ser un texto (URL)' })
  imagen?: string[]; 
}


export class ActualizarEstadoSolicitudDto {
  @IsIn(['aprobada', 'rechazada', 'entregada'])
  estado!: 'aprobada' | 'rechazada' | 'entregada';

  // Solo requerido cuando estado = 'entregada' — de dónde sale la pieza
  @IsOptional()
  @IsString()
  idAlmacen?: string;
}