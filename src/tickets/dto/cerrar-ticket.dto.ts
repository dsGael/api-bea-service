import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CerrarTicketDto {
  @ApiProperty({ description: 'Diagnóstico encontrado en el equipo' })
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio para cerrar el ticket.' })
  diagnostico!: string;

  @ApiProperty({ description: 'Descripción de la reparación realizada' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción de la reparación es obligatoria.' })
  reparacion!: string;

  @ApiPropertyOptional({ description: 'Comentarios adicionales del técnico' })
  @IsString()
  @IsOptional()
  comentarios?: string;

  @ApiPropertyOptional({ description: 'URL de la primera evidencia fotográfica' })
  @IsString() // Puedes cambiarlo a @IsUrl() si guardas enlaces completos de S3/Cloud Storage
  @IsOptional()
  imagen1?: string;

  @ApiPropertyOptional({ description: 'URL de la segunda evidencia fotográfica' })
  @IsString()
  @IsOptional()
  imagen2?: string;
}