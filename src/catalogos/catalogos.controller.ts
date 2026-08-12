import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  // ============================================================================
  // SECCIÓN 1: ENDPOINTS CON CRUD COMPLETO
  // ============================================================================

  // --- AUTOBUSES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('autobuses')
  listarAutobuses() { return this.catalogosService.listarAutobuses(); }

  @Get('autobuses/:id')
  obtenerAutobus(@Param('id') id: string) { return this.catalogosService.obtenerAutobus(id); }

  @Post('autobuses')
  @Roles('admin', 'superadmin', 'mesacontrol')
  crearAutobus(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearAutobus(dto, user.useremail); }

  @Patch('autobuses/:id')
  @Roles('admin', 'superadmin', 'mesacontrol')
  actualizarAutobus(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarAutobus(id,dto); }


  // -- HORARIOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('horarios')
  listarHorarios() { return this.catalogosService.listarHorarios(); }

  @Get('horarios/:id')
  obtenerHorario(@Param('id') id: string) { return this.catalogosService.obtenerHorario(id); }

  @Post('horarios')
  @Roles('admin', 'superadmin')
  crearHorario(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearHorario(dto, user.useremail); }

  @Patch('horarios/:id')
  @Roles('admin', 'superadmin')
  actualizarHorario(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarHorario(id,dto); }

  // --- CARROCERÍAS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('carrocerias')
  listarCarrocerias() { return this.catalogosService.listarCarrocerias(); }

  @Get('carrocerias/:id')
  obtenerCarroceria(@Param('id') id: string) { return this.catalogosService.obtenerCarroceria(id); }

  @Post('carrocerias')
  @Roles('admin', 'superadmin')
  crearCarroceria(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearCarroceria(dto, user.useremail); }

  @Patch('carrocerias/:id')
  @Roles('admin', 'superadmin')
  actualizarCarroceria(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarCarroceria(id,dto); }


  // --- CELULARES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('celulares')
  listarCelulares() { return this.catalogosService.listarCelulares(); }

  @Get('celulares/:id')
  obtenerCelular(@Param('id') id: string) { return this.catalogosService.obtenerCelular(id); }

  @Post('celulares')
  @Roles('admin', 'superadmin')
  crearCelular(@Body() dto: any) { return this.catalogosService.crearCelular(dto); }

  @Patch('celulares/:id')
  @Roles('admin', 'superadmin')
  actualizarCelular(@Param('id') id: string, @Body() dto: any) { return this.catalogosService.actualizarCelular(id, dto); }


  // --- CIUDADES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('ciudades')
  listarCiudades() { return this.catalogosService.listarCiudades(); }

  @Get('ciudades/:id')
  obtenerCiudad(@Param('id') id: string) { return this.catalogosService.obtenerCiudad(id); }

  @Post('ciudades')
  @Roles('admin', 'superadmin')
  crearCiudad(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearCiudad(dto, user.useremail); }

  @Patch('ciudades/:id')
  @Roles('admin', 'superadmin')
  actualizarCiudad(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarCiudad(id,dto); }


  // --- DEPARTAMENTOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('departamentos')
  listarDepartamentos() { return this.catalogosService.listarDepartamentos(); }

  @Get('departamentos/:id')
  obtenerDepartamento(@Param('id') id: string) { return this.catalogosService.obtenerDepartamento(id); }

  @Post('departamentos')
  @Roles('admin', 'superadmin')
  crearDepartamento(@Body() dto: any) { return this.catalogosService.crearDepartamento(dto); }

  @Patch('departamentos/:id')
  @Roles('admin', 'superadmin')
  actualizarDepartamento(@Param('id') id: string, @Body() dto: any) { return this.catalogosService.actualizarDepartamento(id, dto); }


  // --- DIAGNÓSTICOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('diagnosticos')
  listarDiagnosticos() { return this.catalogosService.listarDiagnosticos(); }

  @Get('diagnosticos/:id')
  obtenerDiagnostico(@Param('id') id: string) { return this.catalogosService.obtenerDiagnostico(id); }

  @Post('diagnosticos')
  @Roles('admin', 'superadmin', 'tecnicojr', 'tecnicosinior')
  crearDiagnostico(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearDiagnostico(dto, user.useremail); }

  @Patch('diagnosticos/:id')
  @Roles('admin', 'superadmin')
  actualizarDiagnostico(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarDiagnostico(id,dto); }


  // --- DISPOSITIVOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('dispositivos')
  listarDispositivos() { return this.catalogosService.listarDispositivos(); }

  @Get('dispositivos/:id')
  obtenerDispositivo(@Param('id') id: string) { return this.catalogosService.obtenerDispositivo(id); }

  @Post('dispositivos')
  @Roles('admin', 'superadmin', 'almacen')
  crearDispositivo(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearDispositivo(dto, user.useremail); }

  @Patch('dispositivos/:id')
  @Roles('admin', 'superadmin', 'almacen')
  actualizarDispositivo(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarDispositivo(id,dto); }


  // --- TIPOS DE DISPOSITIVOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('tipos-dispositivos')
  listarTiposDispositivos() { return this.catalogosService.listarTiposDispositivos(); }

  @Get('tipos-dispositivos/:id')
  obtenerTipoDispositivo(@Param('id') id: string) { return this.catalogosService.obtenerTipoDispositivo(id); }

  @Post('tipos-dispositivos')
  @Roles('admin', 'superadmin')
  crearTipoDispositivo(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearTipoDispositivo(dto, user.useremail); }

  @Patch('tipos-dispositivos/:id')
  @Roles('admin', 'superadmin')
  actualizarTipoDispositivo(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarTipoDispositivo(id,dto); }


  // --- EMPRESAS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('empresas')
  listarEmpresas() { return this.catalogosService.listarEmpresas(); }

  @Get('empresas/:id')
  obtenerEmpresa(@Param('id') id: string) { return this.catalogosService.obtenerEmpresa(id); }

  @Post('empresas')
  @Roles('admin', 'superadmin')
  crearEmpresa(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearEmpresa(dto, user.useremail); }

  @Patch('empresas/:id')
  @Roles('admin', 'superadmin')
  actualizarEmpresa(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarEmpresa(id,dto); }


  // --- FALLAS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('fallas')
  listarFallas() { return this.catalogosService.listarFallas(); }

  @Get('fallas/:id')
  obtenerFalla(@Param('id') id: string) { return this.catalogosService.obtenerFalla(id); }

  @Post('fallas')
  @Roles('admin', 'superadmin', 'mesacontrol')
  crearFalla(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearFalla(dto, user.useremail); }

  @Patch('fallas/:id')
  @Roles('admin', 'superadmin', 'mesacontrol')
  actualizarFalla(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarFalla(id,dto); }


  // --- REPORTA ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('reporta')
  listarReporta() { return this.catalogosService.listarReporta(); }

  @Get('reporta/:id')
  obtenerReporta(@Param('id') id: string) { return this.catalogosService.obtenerReporta(id); }

  @Post('reporta')
  @Roles('admin', 'superadmin')
  crearReporta(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearReporta(dto, user.useremail); }

  @Patch('reporta/:id')
  @Roles('admin', 'superadmin')
  actualizarReporta(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarReporta(id,dto); }


  // --- RUTAS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('rutas')
  listarRutas() { return this.catalogosService.listarRutas(); }

  @Get('rutas/:id')
  obtenerRuta(@Param('id') id: string) { return this.catalogosService.obtenerRuta(id); }

  @Post('rutas')
  @Roles('admin', 'superadmin', 'mesacontrol')
  crearRuta(@Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.crearRuta(dto, user.useremail); }

  @Patch('rutas/:id')
  @Roles('admin', 'superadmin', 'mesacontrol')
  actualizarRuta(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.catalogosService.actualizarRuta(id,dto); }


  // --- SIMS DVR ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('sims-dvr')
  listarSimsDvr() { return this.catalogosService.listarSimsDvr(); }

  @Get('sims-dvr/:id')
  obtenerSimDvr(@Param('id') id: string) { return this.catalogosService.obtenerSimDvr(id); }

  @Post('sims-dvr')
  @Roles('admin', 'superadmin', 'almacen')
  crearSimDvr(@Body() dto: any) { return this.catalogosService.crearSimDvr(dto); }

  @Patch('sims-dvr/:id')
  @Roles('admin', 'superadmin', 'almacen')
  actualizarSimDvr(@Param('id') id: string, @Body() dto: any) { return this.catalogosService.actualizarSimDvr(id, dto); }


  // --- SUELDOS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('sueldos')
  listarSueldos() { return this.catalogosService.listarSueldos(); }

  @Get('sueldos/:id')
  obtenerSueldo(@Param('id') id: string) { return this.catalogosService.obtenerSueldo(id); }

  @Post('sueldos')
  @Roles('admin', 'superadmin')
  crearSueldo(@Body() dto: any) { return this.catalogosService.crearSueldo(dto); }

  @Patch('sueldos/:id')
  @Roles('admin', 'superadmin')
  actualizarSueldo(@Param('id') id: string, @Body() dto: any) { return this.catalogosService.actualizarSueldo(id, dto); }


  // ============================================================================
  // SECCIÓN 2: ENDPOINTS DE SOLO LECTURA (Listar todos y Leer 1)
  // ============================================================================

  // --- CATEGORÍAS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('categorias')
  listarCategorias() { return this.catalogosService.listarCategorias(); }

  @Get('categorias/:id')
  obtenerCategoria(@Param('id') id: string) { return this.catalogosService.obtenerCategoria(id); }


  // --- ESTADOS GLOBALES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('estados')
  listarEstados() { return this.catalogosService.listarEstados(); }

  @Get('estados/:id')
  obtenerEstado(@Param('id') id: string) { return this.catalogosService.obtenerEstado(id); }


  // --- ESTADOS DE AUTOBÚS ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('estados-autobus')
  listarEstadosAutobus() { return this.catalogosService.listarEstadosAutobus(); }

  @Get('estados-autobus/:id')
  obtenerEstadoAutobus(@Param('id') id: string) { return this.catalogosService.obtenerEstadoAutobus(id); }


  // --- ESTADOS DE REPARACIÓN ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('estados-reparacion')
  listarEstadosReparacion() { return this.catalogosService.listarEstadosReparacion(); }

  @Get('estados-reparacion/:id')
  obtenerEstadoReparacion(@Param('id') id: string) { return this.catalogosService.obtenerEstadoReparacion(id); }


  // --- PERFILES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('perfiles')
  listarPerfiles() { return this.catalogosService.listarPerfiles(); }

  @Get('perfiles/:id')
  obtenerPerfil(@Param('id') id: string) { return this.catalogosService.obtenerPerfil(id); }


  // --- PRIORIDADES ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('prioridades')
  listarPrioridades() { return this.catalogosService.listarPrioridades(); }

  @Get('prioridades/:id')
  obtenerPrioridad(@Param('id') id: string) { return this.catalogosService.obtenerPrioridad(id); }


  // --- TIPOS DE REPARACIÓN ---
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @Get('tipos-reparacion')
  listarTiposReparacion() { return this.catalogosService.listarTiposReparacion(); }

  @Get('tipos-reparacion/:id')
  obtenerTipoReparacion(@Param('id') id: string) { return this.catalogosService.obtenerTipoReparacion(id); }

  // ============================================================================
  // SECCIÓN 3: ENDPOINTS DE CONSULTA ESPECÍFICA (Filtros, búsquedas, etc.)
  // ============================================================================

  @Get('diagnostico/falla')
  @ApiOperation({ summary: 'Diagnósticos y reparaciones posibles para un tipo de dispositivo' })
  listarDiagnosticosPorFalla(@Query('idFalla') idFalla: string) {
  return this.catalogosService.listarDiagnosticosPorFalla(idFalla);
  }

  @Get('dispositivo/tipo/:tipo')
  @ApiOperation({ summary: 'Dispositivos disponibles para un tipo específico' })
  listarDispositivosPorTipo(@Param('tipo') tipo: string) {
    return this.catalogosService.listarDispositivosPorTipo(tipo);
  }

}