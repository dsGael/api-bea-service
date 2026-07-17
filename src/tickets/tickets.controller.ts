import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CrearTicketDto ,CrearFolioMantenimientoDto} from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto,ValidarTicketDto } from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';

// @UseGuards(JwtAuthGuard) // <-- Descomenta esto si usas protección por token
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ==========================================
  // CONSULTAS (GET)
  // ==========================================

  @Get()
  listarTodos(@Query() query: ListarTicketsQueryDto) {
    return this.ticketsService.listarTodos(query);
  }

  @Get('tecnico/:idtecnico')
  listarPorTecnico(@Param('idtecnico') idtecnico: string) {
    return this.ticketsService.listarPorTecnico(idtecnico);
  }

  @Get(':idticket')
  obtenerPorId(@Param('idticket') idticket: string) {
    return this.ticketsService.obtenerPorId(idticket);
  }

  // ==========================================
  // CREACIÓN (POST)
  // ==========================================

  @Post()
  crearTicket(@Body() dto: CrearTicketDto, @Req() req: any) {
    // Ajusta req.user.idUsuario según cómo venga tu payload del JWT
    const usuario = req.user?.idUsuario || 'SISTEMA'; 
    return this.ticketsService.crearTicket(dto, usuario);
  }

  @Post('mantenimiento')
  crearFolioMantenimiento(
    @Body() dto: CrearFolioMantenimientoDto, 
    @Req() req: any
  ) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    // Asumimos que el idtecnico viene en el token del usuario logueado
    const idtecnico = req.user?.idEmpleado || 'TEC_DEFAULT'; 
    
    return this.ticketsService.crearFolioMantenimiento(dto, idtecnico, usuario);
  }

  // ==========================================
  // MODIFICACIÓN Y FLUJO DE ESTADOS (PATCH)
  // ==========================================

  @Patch(':idticket/asignar')
  asignarTecnico(
    @Param('idticket') idticket: string,
    @Body() dto: AsignarTecnicoDto,
    @Req() req: any
  ) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.asignarTecnico(idticket, dto, usuario);
  }

  @Patch(':idticket/reparacion')
  registrarReparacion(
    @Param('idticket') idticket: string,
    @Body() dto: CerrarTicketDto,
    @Req() req: any
  ) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.registrarReparacion(idticket, dto, usuario);
  }

  @Patch(':idticket/validar')
  validarTicket(
    @Param('idticket') idticket: string,
    @Body() dto: ValidarTicketDto,
    @Req() req: any
  ) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.validarTicket(idticket, dto, usuario);
  }

  @Patch(':idticket/pendiente')
  marcarPendiente(@Param('idticket') idticket: string, @Req() req: any) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.marcarPendiente(idticket, usuario);
  }

  @Patch(':idticket/reanudar')
  reanudarTicket(@Param('idticket') idticket: string, @Req() req: any) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.reanudarTicket(idticket, usuario);
  }

  @Patch(':idticket/cancelar')
  cancelarTicket(@Param('idticket') idticket: string, @Req() req: any) {
    const usuario = req.user?.idUsuario || 'SISTEMA';
    return this.ticketsService.cancelarTicket(idticket, usuario);
  }
}