import { IsString, IsOptional } from 'class-validator';

export class CerrarTicketDto {
  @IsString()
  diagnostico!: string;

  @IsString()
  reparacion!: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  imagen1?: string;

  @IsOptional()
  @IsString()
  imagen2?: string;
}