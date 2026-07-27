import { IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

const PAQUETERIAS_PERMITIDAS = [
  'AMAZON', 'CASTORES', 'DHL', 'FEDEX', 
  'PAQUETE EXPRESS', 'SERVICIO PRIVADO', 'TRES GUERRAS', 'UPS'
];

const  PROYECTOS_PERMITIDOS = [
  'Inst.HMO367', 'Inst.OBR20', 'BeaSonora', 'Personal'
];

export class  CrearEnvioDto {
  @IsOptional()
  @IsString()
  folioEnvio?: string;

  @IsOptional()
  @IsString()
  guia?: string;

  @IsOptional()
  @IsIn(PAQUETERIAS_PERMITIDAS, { message: 'Paquetería no válida' })
  paqueteria?: string;

  @IsOptional()
  @IsString()
  remitente?: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsInt()
  cantidadCajas?: number;

  @IsOptional()
  @IsString()
  @IsIn(PROYECTOS_PERMITIDOS, { message: 'Proyecto no válido' })
  proyecto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  packingList?: string; //PDF del packing list
}

export class ActualizarEnvioDto extends PartialType(CrearEnvioDto) {}