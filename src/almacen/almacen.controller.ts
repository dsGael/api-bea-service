import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AlmacenService } from './almacen.service';
import { CrearAlmacenDto } from './dto/almacen.dto';
import { ActualizarAlmacenDto } from './dto/almacen.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('almacen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('almacenes')
export class AlmacenController {
  constructor(private almacenService: AlmacenService) {}

  @Get()
  @Roles('almacen', 'mesacontrol', 'supervisor', 'admin', 'superAdmin')
  listar() {
    return this.almacenService.listar();
  }

  @Get(':id')
  @Roles('almacen', 'mesacontrol', 'supervisor', 'admin', 'superAdmin')
  obtenerPorId(@Param('id') id: string) {
    return this.almacenService.obtenerPorId(id);
  }

  @Post()
  @Roles('admin', 'superAdmin')
  crear(@Body() dto: CrearAlmacenDto, @CurrentUser() user: any) {
    return this.almacenService.crear(dto, user.useremail);
  }

  @Patch(':id')
  @Roles('admin', 'superAdmin')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarAlmacenDto,
    @CurrentUser() user: any,
  ) {
    return this.almacenService.actualizar(id, dto, user.useremail);
  }
}