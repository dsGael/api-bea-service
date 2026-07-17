import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarTicketsQueryDto {
  @IsOptional()
  @IsString()
  idestado?: string; 

  @IsOptional()
  @IsString()
  idautobus?: string;

  @IsOptional()
  @IsString()
  idruta?: string;

  @IsOptional()
  @IsString()
  idtecnico?: string;

  @IsOptional()
  @IsString()
  idprioridad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}