import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identificador!: string; // acepta idEmpleado O useremail — el service prueba ambo

  @IsString()
  @MinLength(2)
  password!: string;
}