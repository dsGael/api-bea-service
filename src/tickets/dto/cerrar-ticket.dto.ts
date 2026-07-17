import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
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


export class ValidarTicketDto {
  @IsBoolean({ message: 'El campo aprobado debe ser un valor booleano (true o false)' })
  @IsNotEmpty({ message: 'Debe especificar si el ticket es aprobado o rechazado' })
  aprobado!: boolean;

  // ValidateIf hace que este campo sea obligatorio SOLO si aprobado es falso
  @ValidateIf((objeto) => objeto.aprobado === false)
  @IsString({ message: 'El comentario de rechazo debe ser texto' })
  @IsNotEmpty({ message: 'Debe proporcionar un motivo de rechazo para devolver el ticket' })
  comentarioRechazo?: string;
}