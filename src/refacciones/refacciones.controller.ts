import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RefaccionesService } from './refacciones.service';
import {ActualizarEstadoSolicitudDto, CrearSolicitudDto } from './dto/crear-actualizar-solicitud.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('refacciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('refacciones')
export class RefaccionesController {
  constructor(private readonly refaccionesService: RefaccionesService) {}

  @Post()
  @Roles('tecnicojr', 'tecnicosinior')
  crear(@Body() dto: CrearSolicitudDto, @CurrentUser() user: any) {
    return this.refaccionesService.crear(dto, user.idEmpleado);
  }

  @Get('tecnico/:id')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol', 'admin', 'superadmin')
  listarPorTecnico(@Param('id') id: string) {
    return this.refaccionesService.listarPorTecnico(id);
  }

  @Get()
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  listarTodas(@Query('estado') estado?: string) {
    return this.refaccionesService.listarTodas(estado);
  }

  @Patch(':id/estado')
  @Roles('almacen', 'admin', 'superadmin')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoSolicitudDto,
    @CurrentUser() user: any,
  ) {
    return this.refaccionesService.actualizarEstado(id, dto, user.idUsuario);
  }
}