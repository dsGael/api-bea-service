import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MovimientosService } from './movimientos.service';
import { RegistrarMovimientoDto } from './dto/movimiento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('movimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  @Roles('almacen', 'admin', 'superadmin')
  registrar(@Body() dto: RegistrarMovimientoDto, @CurrentUser() user: any) {
    return this.movimientosService.registrarMovimiento(dto, user.useremail);
  }

  @Get()
  @Roles('almacen', 'mesacontrol', 'supervisor', 'admin', 'superadmin')
  listar(
    @Query('idAlmacen') idAlmacen?: string,
    @Query('idDispositivo') idDispositivo?: string,
  ) {
    return this.movimientosService.listarMovimientos(idAlmacen, idDispositivo);
  }

  @Get('existencia')
  @Roles('almacen', 'mesacontrol', 'supervisor', 'admin', 'superadmin')
  existencia(
    @Query('idAlmacen') idAlmacen: string,
    @Query('idDispositivo') idDispositivo: string,
  ) {
    return this.movimientosService
      .calcularExistencia(idAlmacen, idDispositivo)
      .then((existencia) => ({ idAlmacen, idDispositivo, existencia }));
  }
}