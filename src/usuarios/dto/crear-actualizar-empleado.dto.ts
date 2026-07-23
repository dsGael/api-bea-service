import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsInt, MinLength } from 'class-validator';

export class CrearEmpleadoDto {
  // Credenciales/operativo (van a cat_usuarios_app)
  @IsEmail()
  useremail!: string; // ahora es el identificador real de login, ya no un idUsuario elegido

  @IsString()
  @MinLength(4)
  password!: string;

  @IsString()
  perfil!: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  // Datos personales/laborales (van a cat_empleados)
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsInt()
  numEmpleado?: number;

  @IsOptional()
  @IsString()
  idEmpresa?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  puesto?: string;

  @IsOptional()
  @IsString()
  idHorario?: string;
}

export class ActualizarEmpleadoDto extends PartialType(
  OmitType(CrearEmpleadoDto, ['useremail', 'password', 'perfil'] as const),
) {}

 
export class CambiarPasswordDto {
  @IsString()
  @MinLength(4)
  passwordNuevo!: string;
}


export class CambiarPerfilDto {
  @IsString()
  perfil!: string;
}