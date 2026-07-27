import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OperacionesService } from './operaciones.service';
import { CrearAsignacionDto } from './dto/asignacion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('operaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operacionesService: OperacionesService) {}

  @Post('asignacion-diaria')
  @Roles('admin', 'superadmin', 'mesacontrol') // O el rol del despachador
  crear(@Body() dto: CrearAsignacionDto) {
    return this.operacionesService.crearAsignacion(dto);
  }

  @Get('asignacion-diaria')
  @Roles('admin', 'superadmin', 'mesacontrol', 'supervisor')
  listarHoy(@Query('fecha') fecha?: string) {
    // Por defecto, que traiga las del día en curso si no le mandan fecha
    return this.operacionesService.listarAsignaciones(fecha);
  }
}