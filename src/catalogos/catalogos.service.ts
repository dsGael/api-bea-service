import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

// Importamos todos los DTOs desde el archivo único
import {
  CrearAutobusDto, ActualizarAutobusDto,
  CrearCarroceriaDto, ActualizarCarroceriaDto,
  CrearCelularDto, ActualizarCelularDto,
  CrearCiudadDto, ActualizarCiudadDto,
  CrearDepartamentoDto, ActualizarDepartamentoDto,
  CrearDiagnosticoDto, ActualizarDiagnosticoDto,
  CrearDispositivoDto, ActualizarDispositivoDto,
  CrearTipoDispositivoDto, ActualizarTipoDispositivoDto,
  CrearEmpresaDto, ActualizarEmpresaDto,
  CrearFallaDto, ActualizarFallaDto,
  CrearReportaDto, ActualizarReportaDto,
  CrearRutaDto, ActualizarRutaDto,
  CrearSimsDvrDto, ActualizarSimsDvrDto,
  CrearSueldoDto, ActualizarSueldoDto,
} from './dto/catalogos.dto';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // SECCIÓN 1: CATÁLOGOS CON CRUD COMPLETO
  // ============================================================================

  // --- AUTOBUSES ---
  async listarAutobuses() { return this.prisma.cat_autobus.findMany({ orderBy: { numeroEconomico: 'asc' } }); }
  async obtenerAutobus(id: string) { return this.prisma.cat_autobus.findUnique({ where: { idAutobus: id } }); }
  async crearAutobus(dto: CrearAutobusDto, usuario: string) {
    return this.prisma.cat_autobus.create({ 
      data: { idAutobus: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date().toISOString() } 
    });
  }
  async actualizarAutobus(id: string, dto: ActualizarAutobusDto, usuario: string) {
    return this.prisma.cat_autobus.update({ 
      where: { idAutobus: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date().toISOString() } 
    });
  }

  // --- CARROCERÍAS ---
  async listarCarrocerias() { return this.prisma.cat_carroceria.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerCarroceria(id: string) { return this.prisma.cat_carroceria.findUnique({ where: { idCarroceria: id } }); }
  async crearCarroceria(dto: CrearCarroceriaDto, usuario: string) {
    return this.prisma.cat_carroceria.create({ 
      data: { idCarroceria: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarCarroceria(id: string, dto: ActualizarCarroceriaDto, usuario: string) {
    return this.prisma.cat_carroceria.update({ 
      where: { idCarroceria: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date().toISOString() } 
    });
  }

  // --- CELULARES ---
  async listarCelulares() { return this.prisma.cat_celular.findMany({ orderBy: { noEconomico: 'asc' } }); }
  async obtenerCelular(id: string) { return this.prisma.cat_celular.findUnique({ where: { idCelular: id } }); }
  async crearCelular(dto: CrearCelularDto) {
    return this.prisma.cat_celular.create({ data: { idCelular: randomUUID(), ...dto } });
  }
  async actualizarCelular(id: string, dto: ActualizarCelularDto) {
    return this.prisma.cat_celular.update({ where: { idCelular: id }, data: { ...dto } });
  }

  // --- CIUDADES ---
  async listarCiudades() { return this.prisma.cat_ciudad.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerCiudad(id: string) { return this.prisma.cat_ciudad.findUnique({ where: { idCiudad: id } }); }
  async crearCiudad(dto: CrearCiudadDto, usuario: string) {
    return this.prisma.cat_ciudad.create({ 
      data: { idCiudad: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarCiudad(id: string, dto: ActualizarCiudadDto, usuario: string) {
    return this.prisma.cat_ciudad.update({ 
      where: { idCiudad: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date().toISOString() } 
    });
  }

  // --- DEPARTAMENTOS ---
  async listarDepartamentos() { return this.prisma.cat_departamentos.findMany({ orderBy: { Departamento: 'asc' } }); }
  async obtenerDepartamento(id: string) { return this.prisma.cat_departamentos.findUnique({ where: { idDepartamento: id } }); }
  async crearDepartamento(dto: CrearDepartamentoDto) {
    return this.prisma.cat_departamentos.create({ data: { idDepartamento: randomUUID(), ...dto } });
  }
  async actualizarDepartamento(id: string, dto: ActualizarDepartamentoDto) {
    return this.prisma.cat_departamentos.update({ where: { idDepartamento: id }, data: { ...dto } });
  }

  // --- DIAGNÓSTICOS ---
  async listarDiagnosticos() { return this.prisma.cat_diagnostico.findMany({ orderBy: { fallaNombre: 'asc' } }); }
  async obtenerDiagnostico(id: string) { return this.prisma.cat_diagnostico.findUnique({ where: { idDiagnostico: id } }); }
  async crearDiagnostico(dto: CrearDiagnosticoDto, usuario: string) {
    return this.prisma.cat_diagnostico.create({ 
      data: { idDiagnostico: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarDiagnostico(id: string, dto: ActualizarDiagnosticoDto, usuario: string) {
    return this.prisma.cat_diagnostico.update({ 
      where: { idDiagnostico: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date().toISOString() } 
    });
  }

  // --- DISPOSITIVOS ---
  async listarDispositivos() { return this.prisma.cat_dispositivo.findMany({ orderBy: { numeroSerie: 'asc' } }); }
  async obtenerDispositivo(id: string) { return this.prisma.cat_dispositivo.findUnique({ where: { idDispositivo: id } }); }
  async crearDispositivo(dto: CrearDispositivoDto, usuario: string) {
    return this.prisma.cat_dispositivo.create({ 
      data: { idDispositivo: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarDispositivo(id: string, dto: ActualizarDispositivoDto, usuario: string) {
    return this.prisma.cat_dispositivo.update({ 
      where: { idDispositivo: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date() } 
    });
  }

  // --- TIPOS DE DISPOSITIVO ---
  async listarTiposDispositivos() { return this.prisma.cat_dispositivo_t.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerTipoDispositivo(id: string) { return this.prisma.cat_dispositivo_t.findUnique({ where: { idDispositivoT: id } }); }
  async crearTipoDispositivo(dto: CrearTipoDispositivoDto, usuario: string) {
    return this.prisma.cat_dispositivo_t.create({ 
      data: { idDispositivoT: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarTipoDispositivo(id: string, dto: ActualizarTipoDispositivoDto, usuario: string) {
    return this.prisma.cat_dispositivo_t.update({ 
      where: { idDispositivoT: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date().toISOString() } 
    });
  }

  // --- EMPRESAS ---
  async listarEmpresas() { return this.prisma.cat_empresa.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerEmpresa(id: string) { return this.prisma.cat_empresa.findUnique({ where: { idEmpresa: id } }); }
  async crearEmpresa(dto: CrearEmpresaDto, usuario: string) {
    return this.prisma.cat_empresa.create({ 
      data: { idEmpresa: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarEmpresa(id: string, dto: ActualizarEmpresaDto, usuario: string) {
    return this.prisma.cat_empresa.update({ 
      where: { idEmpresa: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date() } 
    });
  }

  // --- FALLAS ---
  async listarFallas() { return this.prisma.cat_falla.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerFalla(id: string) { return this.prisma.cat_falla.findUnique({ where: { idFalla: id } }); }
  async crearFalla(dto: CrearFallaDto, usuario: string) {
    return this.prisma.cat_falla.create({ 
      data: { idFalla: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarFalla(id: string, dto: ActualizarFallaDto, usuario: string) {
    return this.prisma.cat_falla.update({ 
      where: { idFalla: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date() } 
    });
  }

  // --- REPORTA ---
  async listarReporta() { return this.prisma.cat_reporta.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerReporta(id: string) { return this.prisma.cat_reporta.findUnique({ where: { idReporta: id } }); }
  async crearReporta(dto: CrearReportaDto, usuario: string) {
    return this.prisma.cat_reporta.create({ 
      data: { idReporta: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date().toISOString() } 
    });
  }
  async actualizarReporta(id: string, dto: ActualizarReportaDto, usuario: string) {
    return this.prisma.cat_reporta.update({ 
      where: { idReporta: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date() } 
    });
  }

  // --- RUTAS ---
  async listarRutas() { return this.prisma.cat_ruta.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerRuta(id: string) { return this.prisma.cat_ruta.findUnique({ where: { idRuta: id } }); }
  async crearRuta(dto: CrearRutaDto, usuario: string) {
    return this.prisma.cat_ruta.create({ 
      data: { idRuta: randomUUID(), ...dto, creadoPor: usuario, fechaCreacion: new Date() } 
    });
  }
  async actualizarRuta(id: string, dto: ActualizarRutaDto, usuario: string) {
    return this.prisma.cat_ruta.update({ 
      where: { idRuta: id }, 
      data: { ...dto, modificadoPor: usuario, fechaModificacion: new Date() } 
    });
  }

  // --- SIMS DVR ---
  async listarSimsDvr() { return this.prisma.cat_sims_dvr.findMany({ orderBy: { SIM: 'asc' } }); }
  async obtenerSimDvr(id: string) { return this.prisma.cat_sims_dvr.findUnique({ where: { idSimDvr: id } }); }
  async crearSimDvr(dto: CrearSimsDvrDto) {
    return this.prisma.cat_sims_dvr.create({ data: { idSimDvr: randomUUID(), ...dto } });
  }
  async actualizarSimDvr(id: string, dto: ActualizarSimsDvrDto) {
    return this.prisma.cat_sims_dvr.update({ where: { idSimDvr: id }, data: { ...dto } });
  }

  // --- SUELDOS ---
  async listarSueldos() { return this.prisma.cat_sueldos.findMany({ orderBy: { Puesto: 'asc' } }); }
  async obtenerSueldo(id: string) { return this.prisma.cat_sueldos.findUnique({ where: { idSueldo: id } }); }
  async crearSueldo(dto: CrearSueldoDto) {
    return this.prisma.cat_sueldos.create({ data: { idSueldo: randomUUID(), ...dto } });
  }
  async actualizarSueldo(id: string, dto: ActualizarSueldoDto) {
    return this.prisma.cat_sueldos.update({ where: { idSueldo: id }, data: { ...dto } });
  }


  // ============================================================================
  // SECCIÓN 2: CATÁLOGOS DE SOLO LECTURA (Listar todos, Leer 1)
  // ============================================================================

  // --- CATEGORÍAS ---
  async listarCategorias() { return this.prisma.cat_categoria.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerCategoria(id: string) { return this.prisma.cat_categoria.findUnique({ where: { idCategoria: id } }); }

  // --- ESTADOS GLOBALES ---
  async listarEstados() { return this.prisma.cat_estado.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerEstado(id: string) { return this.prisma.cat_estado.findUnique({ where: { idEstado: id } }); }

  // --- ESTADOS DE AUTOBÚS ---
  async listarEstadosAutobus() { return this.prisma.cat_estado_a.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerEstadoAutobus(id: string) { return this.prisma.cat_estado_a.findUnique({ where: { idEstadoA: id } }); }

  // --- ESTADOS DE REPARACIÓN ---
  async listarEstadosReparacion() { return this.prisma.cat_estado_r.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerEstadoReparacion(id: string) { return this.prisma.cat_estado_r.findUnique({ where: { idEstadoR: id } }); }

  // --- PERFILES ---
  async listarPerfiles() { return this.prisma.cat_perfiles.findMany({ orderBy: { perfil: 'asc' } }); }
  async obtenerPerfil(id: string) { return this.prisma.cat_perfiles.findUnique({ where: { idPerfil: id } }); }

  // --- PRIORIDADES ---
  async listarPrioridades() { return this.prisma.cat_prioridad.findMany({ orderBy: { nombre: 'asc' } }); }
  async obtenerPrioridad(id: string) { return this.prisma.cat_prioridad.findUnique({ where: { idPrioridad: id } }); }

  // --- TIPOS DE REPARACIÓN ---
  async listarTiposReparacion() { return this.prisma.cat_tipo_reparacion.findMany({ orderBy: { tipoReparacion: 'asc' } }); }
  async obtenerTipoReparacion(id: string) { return this.prisma.cat_tipo_reparacion.findUnique({ where: { idtipoReparacion: id } }); }

}