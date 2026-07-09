import { IsString } from 'class-validator';

export class AsignarTecnicoDto {
  @IsString()
  idtecnico!: string;
}