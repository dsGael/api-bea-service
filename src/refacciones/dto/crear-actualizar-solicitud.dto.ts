import { IsString, IsOptional, IsNumber, Min, IsIn } from 'class-validator';

export class CrearSolicitudDto {

  @IsOptional()
  @IsString()
  idSolicitud?: string; // Opcional — puede solicitarse sin estar ligado a un folio

  @IsOptional()
  @IsString()
  idticket?: string; // Opcional — puede solicitarse sin estar ligado a un folio

  @IsString()
  idDispositivo!: string; // idDispositivoT — tipo de refacción/pieza

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  cantidad?: number = 1;

  @IsOptional()
  @IsString()
  idtecnico?: string;

}

export class ActualizarEstadoSolicitudDto {
  @IsIn(['pendiente', 'entregada', 'rechazado', 'no hay stock'], {
    message: 'El estado debe ser: pendiente, entregada, rechazado, no hay stock',
  })
  estado!: 'pendiente' | 'entregada' | 'rechazado' | 'no hay stock';

  @IsOptional()
  @IsString()
  idAlmacen?: string;
}