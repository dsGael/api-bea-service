import { IsString, IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class RegistrarMovimientoDto {
  @IsIn(['entrada', 'salida'])
  tipoMovimiento!: 'entrada' | 'salida';

  @IsString()
  idDispositivo!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsString() // <- Obligatorio
  idAlmacenOrigen!: string; 

  @IsString() // <- Obligatorio
  idAlmacenDestino!: string; 

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  imei1?: string;

  @IsOptional()
  @IsString()
  imei2?: string;

  @IsOptional()
  @IsString()
  comentario?: string;
}