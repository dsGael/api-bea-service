import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CrearTicketDto, CrearFolioMantenimientoDto, EditarTicketDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto, ValidarTicketDto } from './dto/cerrar-ticket.dto';
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

  // ─────────────────────────────────────────────────────────────────────
  // LISTADO ÚNICO PARAMETRIZADO
  // Reemplaza: /tecnico/:id, /mantenimiento, /mantenimiento/abierto,
  // /mantenimiento/tecnico/:id, /mantenimiento/abierto/tecnico/:id,
  // /correctivos/abierto
  //
  // Ejemplos:
  //   GET /tickets?isMantenimiento=true&isAbierto=true
  //   GET /tickets?isMantenimiento=false&isAbierto=true        (correctivos abiertos)
  //   GET /tickets?idtecnico=xxx&isActivo=true                 (mis pendientes)
  // ─────────────────────────────────────────────────────────────────────

  @Get()
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin', 'almacen', 'consultas')
  @ApiOperation({ summary: 'Lista folios con filtros dinámicos (reemplaza los endpoints antiguos)' })
  listarTodos(@Query() query: ListarTicketsQueryDto, @CurrentUser() user: any) {
    console.log('Query parameters:', query);
    return this.ticketsService.listarTodos(query, { idUsuarioApp: user.idUsuarioApp, rol: user.rol });
  }

  // ─────────────────────────────────────────────────────────────────────
  // CREACIÓN Y EDICIÓN (con fotos de la falla)
  // ─────────────────────────────────────────────────────────────────────

  @Post()
  @Roles('superadmin', 'admin', 'mesacontrol', 'capturista')
  @UseInterceptors(FilesInterceptor('evidenciasFalla'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crea un folio normal, con fotos opcionales de la falla' })
  crear(
    @Body() dto: CrearTicketDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.ticketsService.crearTicket(dto, user.idUsuarioApp, files);
  }

  @Post('mantenimiento')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin')
  @UseInterceptors(FilesInterceptor('evidenciasFalla'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crea un folio de mantenimiento preventivo, auto-asignado al técnico' })
  crearMantenimiento(
    @Body() dto: CrearFolioMantenimientoDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.ticketsService.crearFolioMantenimiento(dto, user.idUsuarioApp, user.idUsuarioApp, files);
  }

  @Patch(':id')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin', 'capturista')
  @UseInterceptors(FilesInterceptor('evidenciasFalla'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Edita un folio abierto y/o agrega más fotos de la falla' })
  editar(
    @Param('id') id: string,
    @Body() dto: EditarTicketDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.ticketsService.editarTicket(id, dto, user.idUsuarioApp, files);
  }

  // ─────────────────────────────────────────────────────────────────────
  // DETALLE — después de las rutas literales de arriba
  // ─────────────────────────────────────────────────────────────────────

  @Get(':id')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'admin', 'superadmin', 'almacen', 'consultas')
  @ApiOperation({ summary: 'Obtiene el detalle completo de un folio' })
  obtenerPorId(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.obtenerPorId(id, { idUsuarioApp: user.idUsuarioApp, rol: user.rol });
  }

  // ─────────────────────────────────────────────────────────────────────
  // TRANSICIONES DE ESTADO
  // ─────────────────────────────────────────────────────────────────────

  @Patch(':id/asignar')
  @Roles('mesacontrol', 'admin', 'superadmin')
  @ApiOperation({ summary: 'Asigna un técnico al folio (no cambia el estado)' })
  asignar(@Param('id') id: string, @Body() dto: AsignarTecnicoDto, @CurrentUser() user: any) {
    return this.ticketsService.asignarTecnico(id, dto, user.idUsuarioApp);
  }

  @Patch(':id/reparacion')
  @Roles('tecnicojr', 'tecnicosinior', 'admin', 'superadmin', 'mesacontrol')
  @UseInterceptors(FilesInterceptor('evidenciasReparacion'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Técnico registra su reparación con evidencia fotográfica (Abierto -> Validación MC)',
  })
  registrarReparacion(
    @Param('id') id: string,
    @Body() dto: CerrarTicketDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log('Files received:', files);
    console.log('DTO received:', dto);

    return this.ticketsService.registrarReparacion(id, dto, user.idUsuarioApp, files);
  }

  @Patch(':id/validar')
  @Roles('mesacontrol', 'admin', 'superadmin')
  @ApiOperation({ summary: 'Mesa de control aprueba (Finalizado) o rechaza (regresa a Abierto)' })
  validar(@Param('id') id: string, @Body() dto: ValidarTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.validarTicket(id, dto, user.idUsuarioApp);
  }

  @Patch(':id/pendiente')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol', 'admin', 'superadmin')
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
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Cancela el folio (acción administrativa)' })
  cancelar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.cancelarTicket(id, user.idUsuarioApp);
  }
}