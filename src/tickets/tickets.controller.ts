import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CrearTicketDto,CrearFolioMantenimientoDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto,ValidarTicketDto} from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ── Listados ── van antes que cualquier ruta con :id, para que Nest no
  // intente interpretar "todos" o "mantenimiento" como un idticket.

  @Get()
  @Roles('mesacontrol',  'admin', 'superAdmin', 'almacen', 'consultas')
  @ApiOperation({ summary: 'Lista todos los folios con filtros y paginación' })
  listarTodos(@Query() query: ListarTicketsQueryDto) {
    return this.ticketsService.listarTodos(query);
  }

  @Get('tecnico/:idtecnico')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol',  'admin', 'superAdmin')
  @ApiOperation({ summary: 'Folios abiertos/en validación/pendientes asignados a un técnico' })
  listarPorTecnico(@Param('idtecnico') idtecnico: string) {
    return this.ticketsService.listarPorTecnico(idtecnico);
  }

  // ── Creación ──

  @Post()
  @Roles('superAdmin', 'admin', 'mesacontrol', 'capturista')
  @ApiOperation({ summary: 'Crea un folio normal (reportado por falla)' })
  crear(@Body() dto: CrearTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.crearTicket(dto, user.idUsuarioApp);
  }

  @Post('mantenimiento')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol',  'admin', 'superAdmin')
  @ApiOperation({ summary: 'Crea un folio de mantenimiento preventivo, auto-asignado al técnico' })
  crearMantenimiento(
    @Body() dto: CrearFolioMantenimientoDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.crearFolioMantenimiento(dto, user.idUsuarioApp, user.idUsuarioApp);
  }

  // ── Detalle ── después de las rutas literales de arriba

  @Get(':id')
  @Roles(
    'tecnicojr',
    'tecnicosinior',
    'mesacontrol',
    
    'admin',
    'superAdmin',
    'almacen',
    'consultas',
  )
  obtenerPorId(@Param('id') id: string) {
    return this.ticketsService.obtenerPorId(id);
  }

  // ── Transiciones de estado ──

  @Patch(':id/asignar')
  @Roles('mesacontrol',  'admin', 'superAdmin')
  @ApiOperation({ summary: 'Asigna un técnico al folio (no cambia el estado)' })
  asignar(
    @Param('id') id: string,
    @Body() dto: AsignarTecnicoDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.asignarTecnico(id, dto, user.idUsuarioApp);
  }

  @Patch(':id/reparacion')
  @Roles('tecnicojr', 'tecnicosinior')
  @ApiOperation({ summary: 'Técnico registra su reparación: Abierto -> Validación MC' })
  registrarReparacion(
    @Param('id') id: string,
    @Body() dto: CerrarTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.registrarReparacion(id, dto, user.idUsuarioApp);
  }

  @Patch(':id/validar')
  @Roles('mesacontrol',  'admin', 'superAdmin')
  @ApiOperation({ summary: 'Mesa de control aprueba (Finalizado) o rechaza (regresa a Abierto)' })
  validar(
    @Param('id') id: string,
    @Body() dto: ValidarTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.validarTicket(id, dto, user.idUsuarioApp);
  }

  @Patch(':id/pendiente')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen')
  @ApiOperation({ summary: 'Marca el folio como Pendiente por falta de refacción' })
  marcarPendiente(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.marcarPendiente(id, user.idUsuarioApp);
  }

  @Patch(':id/reanudar')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol')
  @ApiOperation({ summary: 'Regresa el folio de Pendiente a Abierto' })
  reanudar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.reanudarTicket(id, user.idUsuarioApp);
  }

  @Patch(':id/cancelar')
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Cancela el folio (acción administrativa)' })
  cancelar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.cancelarTicket(id, user.idUsuarioApp);
  }
}