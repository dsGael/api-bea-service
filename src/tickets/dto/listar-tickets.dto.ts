import { IsOptional, IsString, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListarTicketsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idestado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idautobus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idruta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idtecnico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idprioridad?: string;

  // --- Flags de negocio, reemplazan a los endpoints dedicados ---

  @ApiPropertyOptional({ description: 'true = solo mantenimiento preventivo, false = solo correctivos' })
  @IsOptional()
  @IsBooleanString()
  isMantenimiento?: string;

  @ApiPropertyOptional({ description: 'true = solo tickets en estado Abierto' })
  @IsOptional()
  @IsBooleanString()
  isAbierto?: string;

  @ApiPropertyOptional({ description: 'true = excluye Finalizado y Cancelado (vista "mis pendientes")' })
  @IsOptional()
  @IsBooleanString()
  isActivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}