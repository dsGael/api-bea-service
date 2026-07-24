import { Controller, Post, Get, Query, Param, Body, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChecadorService } from './checador.service';
import { AjusteChecadaDto, ChecarDto, SyncChecadasDto } from './dto/checar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('checador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checador')
export class ChecadorController {
  constructor(private readonly checadorService: ChecadorService) {}

  @Post()
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin')
  checar(@Body() dto: ChecarDto) {
    return this.checadorService.checar(dto);
  }

  @Post('sync')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin')
  async sincronizarOffline(@Body() dto: SyncChecadasDto) {
    return this.checadorService.sincronizarOffline(dto);
  }

  @Get()
  @Roles('mesacontrol', 'superadmin', 'admin')
  listar() {
    return this.checadorService.listar();
  }

  @Get('metricas')
  @Roles('mesacontrol', 'admin', 'superadmin')
  obtenerMetricas(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.checadorService.obtenerMetricas(desde, hasta);
  }

  @Get('inconsistencias')
  @Roles('mesacontrol', 'superadmin', 'admin')
  listarInconsistencias(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.checadorService.listarInconsistencias(desde, hasta);
  }

  @Get('hoy')
  @Roles('mesacontrol', 'superadmin', 'admin')
  listarHoy() {
    return this.checadorService.listarHoy();
  }



  @Get('mes')
  @Roles('mesacontrol', 'superadmin', 'admin', )
  listarMes(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('anio', ParseIntPipe) anio: number
  ) {
    return this.checadorService.listarMes(mes, anio);
  }


  @Get('rango')
  @Roles('mesacontrol', 'superadmin', 'admin')
  listarRango(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string
  ) {
    return this.checadorService.listarRango(desde, hasta);
  }

  // ==========================================
  // RUTAS CON VARIABLES (:idUsuario / :idChecador)
  // ==========================================

  @Get('estado/:idUsuario')
  @Roles('mesacontrol', 'superadmin', 'admin',  'tecnicojr', 'tecnicosinior')
  obtenerEstado(@Param('idUsuario') idUsuario: string) {
    return this.checadorService.obtenerEstadoActual(idUsuario);
  }

  @Get('nomina/:idUsuario')
  @Roles('mesacontrol', 'admin', 'superadmin')
  resumenQuincenal(
    @Param('idUsuario') idUsuario: string,
    @Query('quincena', ParseIntPipe) quincena: number, // Espera un 1 o un 2
    @Query('mes', ParseIntPipe) mes: number,
    @Query('anio', ParseIntPipe) anio: number,
  ) {
    return this.checadorService.resumenQuincenal(idUsuario, quincena, mes, anio);
  }

  @Patch('ajuste/:idChecador')
  @Roles('mesacontrol', 'admin', 'superadmin')
  ajustarChecada(
    @Param('idChecador') idChecador: string,
    @Body() dto: AjusteChecadaDto
  ) {
    return this.checadorService.ajustarChecadaManual(idChecador, dto);
  }




  @Get('hoy/:idUsuario')
  @Roles('mesacontrol', 'superadmin', 'admin',  'tecnicojr', 'tecnicosinior')
  listarHoyPorUsuario(
    @Param('idUsuario') idUsuario: string
  ) {
    return this.checadorService.listarHoyPorUsuario(idUsuario);
  }

  @Get('mis-asistencias/:idUsuario')
  @Roles('tecnicojr', 'tecnicosinior', 'admin', 'superadmin', 'mesacontrol') 
  misAsistenciasDelMes(@Param('idUsuario') idUsuario: string) {
    return this.checadorService.misAsistenciasActuales(idUsuario);
  }

  @Get(':idUsuario')
  @Roles('mesacontrol', 'superadmin', 'admin',  'tecnicojr', 'tecnicosinior')
  listarPorUsuario(
    @Param('idUsuario') idUsuario: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.checadorService.listarPorUsuario(idUsuario, desde, hasta);
  }

}