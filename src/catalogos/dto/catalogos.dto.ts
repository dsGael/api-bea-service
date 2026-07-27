import { IsString, IsOptional, IsBoolean, IsNumber, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// ==========================================
// 1. AUTOBÚS
// ==========================================
export class CrearAutobusDto {
  @IsOptional() @IsString() numeroEconomico?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsOptional() @IsString() numeroPuertas?: string;
  @IsBoolean() has_nfc!: boolean; // Obligatorio según tu esquema
  @IsOptional() @IsString() rutaCelular?: string;
  @IsOptional() @IsString() noCelular?: string;
  
  // Relaciones
  @IsOptional() @IsString() idRuta?: string;
  @IsOptional() @IsString() idCarroceria?: string;
  @IsOptional() @IsString() idEstadoA?: string;
  @IsOptional() @IsString() idEmpresa?: string;
}
export class ActualizarAutobusDto extends PartialType(CrearAutobusDto) {}

// ==========================================
// 2. CARROCERÍA
// ==========================================
export class CrearCarroceriaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() marca?: string;
}
export class ActualizarCarroceriaDto extends PartialType(CrearCarroceriaDto) {}

// ==========================================
// 3. CELULAR
// ==========================================
export class CrearCelularDto {
  @IsOptional() @IsString() noEconomico?: string;
  @IsOptional() @IsString() LINEA?: string;
  @IsOptional() @IsString() telefono?: string;
}
export class ActualizarCelularDto extends PartialType(CrearCelularDto) {}

// ==========================================
// 4. CIUDAD
// ==========================================
export class CrearCiudadDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsInt() idEstado?: number; // En Prisma es SmallInt
}
export class ActualizarCiudadDto extends PartialType(CrearCiudadDto) {}

// ==========================================
// 5. DEPARTAMENTO
// ==========================================
export class CrearDepartamentoDto {
  @IsOptional() @IsString() Departamento?: string;
  @IsOptional() @IsString() Descripcion?: string;
}
export class ActualizarDepartamentoDto extends PartialType(CrearDepartamentoDto) {}

// ==========================================
// 6. DIAGNÓSTICO
// ==========================================
export class CrearDiagnosticoDto {
  @IsOptional() @IsString() nombreDispositivo?: string;
  @IsOptional() @IsString() fallaNombre?: string;
  @IsOptional() @IsString() diagnostico?: string;
  @IsOptional() @IsString() reparacion?: string;
  @IsOptional() @IsNumber() tiempoReparacionHoras?: number; // En Prisma es Float
  @IsOptional() @IsString() idguia?: string;
  @IsOptional() @IsString() numeroserie?: string;
  @IsOptional() @IsString() celulardvr?: string;
  @IsOptional() @IsString() imei1?: string;
  @IsOptional() @IsString() imei2?: string;
  @IsOptional() @IsString() fechainstalacion?: string;
  @IsOptional() @IsString() comentarios?: string;
  @IsOptional() @IsString() imagen1?: string;
  @IsOptional() @IsString() imagen2?: string;
  
  // Relaciones
  @IsOptional() @IsString() idDispositivoT?: string;
  @IsOptional() @IsString() idFalla?: string;
  @IsOptional() @IsString() iddispositivo?: string;
  @IsOptional() @IsString() idautobus?: string;
  @IsOptional() @IsString() idestadod?: string;
  @IsOptional() @IsString() idalmacenactual?: string;
  @IsOptional() @IsString() idalmacenanterior?: string;
  @IsOptional() @IsString() iddispositivof?: string;
}
export class ActualizarDiagnosticoDto extends PartialType(CrearDiagnosticoDto) {}

// ==========================================
// 7. DISPOSITIVO
// ==========================================
export class CrearDispositivoDto {
  @IsOptional() @IsString() idguia?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsOptional() @IsString() celularDvr?: string;
  @IsOptional() @IsString() imei1?: string;
  @IsOptional() @IsString() imei2?: string;
  @IsOptional() @IsString() comentarios?: string;
  @IsOptional() @IsString() imagen1?: string;
  @IsOptional() @IsString() imagen2?: string;
  
  // Relaciones
  @IsOptional() @IsString() idDispositivoT?: string;
  @IsOptional() @IsString() idAutobus?: string;
  @IsOptional() @IsString() idEstadoD?: string;
  @IsOptional() @IsString() idAlmacenActual?: string;
  @IsOptional() @IsString() idAlmacenAnterior?: string;
  @IsOptional() @IsString() idDispositivoF?: string;
}
export class ActualizarDispositivoDto extends PartialType(CrearDispositivoDto) {}

// ==========================================
// 8. TIPO DE DISPOSITIVO (cat_dispositivo_t)
// ==========================================
export class CrearTipoDispositivoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsBoolean() requiereSerie?: boolean;
}
export class ActualizarTipoDispositivoDto extends PartialType(CrearTipoDispositivoDto) {}

// ==========================================
// 9. EMPRESA
// ==========================================
export class CrearEmpresaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() contaco?: string; // Fiel a tu esquema de BD
  @IsOptional() @IsNumber() telefono?: number; // En Prisma es BigInt
  @IsOptional() @IsString() acronimo?: string;
  
  // Relaciones
  @IsOptional() @IsString() idCiudad?: string;
}
export class ActualizarEmpresaDto extends PartialType(CrearEmpresaDto) {}

// ==========================================
// 10. FALLA
// ==========================================
export class CrearFallaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() falla?: string;
  @IsOptional() @IsString() descripcionFalla?: string;
  
  // Relaciones
  @IsOptional() @IsString() idDispositivo?: string;
}
export class ActualizarFallaDto extends PartialType(CrearFallaDto) {}

// ==========================================
// 11. REPORTA
// ==========================================
export class CrearReportaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() departamento?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() telefono?: string;
  
  // Relaciones
  @IsOptional() @IsString() idEmpresa?: string;
}
export class ActualizarReportaDto extends PartialType(CrearReportaDto) {}

// ==========================================
// 12. RUTA
// ==========================================
export class CrearRutaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsNumber() longitud?: number; // En Prisma es Float
}
export class ActualizarRutaDto extends PartialType(CrearRutaDto) {}

// ==========================================
// 13. SIMS DVR
// ==========================================
export class CrearSimsDvrDto {
  @IsOptional() @IsString() noSerieDvr?: string;
  @IsOptional() @IsString() SIM?: string;
  @IsOptional() @IsString() TEL?: string;
  @IsOptional() @IsString() fechaInstalacion?: string;
  @IsOptional() @IsInt() noControl?: number;
  @IsOptional() @IsString() comentario?: string;
  
  // Relaciones
  @IsOptional() @IsString() idEmpresa?: string;
  @IsOptional() @IsString() idAutobus?: string;
}
export class ActualizarSimsDvrDto extends PartialType(CrearSimsDvrDto) {}

// ==========================================
// 14. SUELDOS
// ==========================================
export class CrearSueldoDto {
  @IsOptional() @IsString() Puesto?: string;
  @IsOptional() @IsString() SueldoDiario?: string;
  @IsOptional() @IsString() SueldoHora?: string;
  @IsOptional() @IsString() HorasPordia?: string;
  @IsOptional() @IsString() PagoExtraPorHora?: string;
  @IsOptional() @IsString() TipoPago?: string;
  @IsOptional() @IsString() Comentarios?: string;
}
export class ActualizarSueldoDto extends PartialType(CrearSueldoDto) {}