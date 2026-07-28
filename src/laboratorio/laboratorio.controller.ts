import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LaboratorioService } from './laboratorio.service';
import { CrearReparacionDto, ActualizarReparacionDto } from './dto/reparacion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('laboratorio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laboratorio') // Fíjate en la ruta
export class LaboratorioController {
  constructor(private readonly laboratorioService: LaboratorioService) {}

    @Post('reparaciones')
    @Roles('almacen', 'mesacontrol', 'admin','superadmin')
    ingresarEquipo(@Body() dto: CrearReparacionDto, @CurrentUser() user: any) {
        return this.laboratorioService.crearReparacion(dto, user.idUsuarioApp); // Pasamos quién lo asigna
    }

    @Get('reparaciones')
    @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
    listarTodas() {
        return this.laboratorioService.listarReparaciones();
    }

    @Get('reparaciones/:id')
    @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
    obtenerPorId(@Param('id') id: string) {
        return this.laboratorioService.obtenerPorId(id);
    }

    @Patch('reparaciones/:id')
    @Roles('admin', 'mesacontrol', 'almacen','superadmin')
    actualizarAvance(@Param('id') id: string, @Body() dto: ActualizarReparacionDto) {
        return this.laboratorioService.actualizar(id, dto);
    }


}