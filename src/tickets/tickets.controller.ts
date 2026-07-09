import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CrearTicketDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto } from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @Roles('superadmin', 'admin', 'mesacontrol', 'capturista')
  crear(@Body() dto: CrearTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.crearTicket(dto, user.useremail);
  }

    @Get()
    @Roles('mesacontrol', 'supervisor', 'admin', 'superadmin', 'almacen', 'consultas')
    listarTodos(@Query() query: ListarTicketsQueryDto) {
    return this.ticketsService.listarTodos(query);
    }

  @Get('tecnico/:idtecnico')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'supervisor', 'admin', 'superadmin')
  listarPorTecnico(@Param('idtecnico') idtecnico: string) {
    return this.ticketsService.listarPorTecnico(idtecnico);
  }

  @Get(':id')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'supervisor', 'admin', 'superadmin', 'almacen', 'consultas')
  obtenerPorId(@Param('id') id: string) {
    return this.ticketsService.obtenerPorId(id);
  }

  @Patch(':id/asignar')
  @Roles('mesacontrol', 'supervisor', 'admin', 'superadmin')
  asignar(
    @Param('id') id: string,
    @Body() dto: AsignarTecnicoDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.asignarTecnico(id, dto, user.useremail);
  }

  @Patch(':id/cerrar')
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'supervisor', 'admin', 'superadmin')
  cerrar(
    @Param('id') id: string,
    @Body() dto: CerrarTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.cerrarTicket(id, dto, user.useremail);
  }
}