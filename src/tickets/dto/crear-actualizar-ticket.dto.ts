import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CrearTicketDto {
  @IsOptional()
  @IsString()
  idticket?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsDateString()
  fechahora?: string;

  @IsOptional()
  @IsString()
  tiporeparacion?: string;


  @IsOptional()
  @IsString()
  idautobus?: string;

  @IsOptional()
  @IsString()
  numeroeconomico?: string;

  @IsOptional()
  @IsString()
  idruta?: string;

  @IsOptional()
  @IsString()
  idoperador?: string;

  @IsOptional()
  @IsString()
  nombreoperador?: string;

  @IsOptional()
  @IsString()
  idusuario?: string;

  @IsOptional()
  @IsString()
  idreporta?: string;

  @IsString()
  iddispositivo!: string;

  @IsOptional()
  @IsString()
  iddispositivot?: string; //appsheet lo rellena desde any(select(catDispositivo[idDispositivoT],[idDispositivo]=[_THISROW].[idDispositivo]))

  @IsString()
  idfalla!: string;

  @IsOptional()
  @IsString()
  idcategoria?: string; // tiene initial value

  @IsOptional()
  @IsString()
  idprioridad?: string;

  @IsOptional()
  @IsString()
  idestado?: string;

  @IsOptional()
  @IsString()
  idtecnico?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  areatrabajo?: string;

  @IsOptional()
  @IsDateString()
  fecharesolucion?: string;

  @IsOptional()
  @IsString()
  creadopor?: string;

  @IsOptional()
  @IsDateString()
  fechacreacion?: string;

  @IsOptional()
  @IsString()
  modificadopor?: string;

  @IsOptional()
  @IsDateString()
  fechamodificacion?: string;

  @IsOptional()
  @IsString()
  estatusrep?: string;

  @IsOptional()
  @IsString()
  msjenviado?: string;

  @IsOptional()
  @IsString()
  foliocliente?: string;

  @IsOptional()
  @IsString()
  reasignado?: string;

  @IsOptional()
  @IsString()
  bloque?: string;

  @IsOptional()
  @IsString()
  locacion?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechareportecliente?: string;

  @IsOptional()
  @IsDateString()
  fechatecnico?: string;

  @IsOptional()
  @IsDateString()
  fechamesa?: string;

  @IsOptional()
  @IsString()
  tiempototal?: string;

  @IsOptional()
  @IsString()
  tiemporetardounidad?: string;

  @IsOptional()
  @IsString()
  imagenfalla1?: string;

  @IsOptional()
  @IsString()
  imagenfalla2?: string;

  @IsOptional()
  @IsString()
  imagenfalla3?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsDateString()
  fechacat?: string;

  @IsOptional()
  @IsString()
  folionumerocliente?: string;

  @IsOptional()
  @IsString()
  confirmarnuevaincidencia?: string;

  @IsOptional()
  @IsString()
  alertafoliosabiertos?: string;

  @IsOptional()
  @IsString()
  resetbot?: string;

  @IsOptional()
  @IsDateString()
  check_in?: string;

  
  @IsOptional()
  @IsString()
  idempresa?: string;




}