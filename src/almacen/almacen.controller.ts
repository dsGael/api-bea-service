import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AlmacenService } from './almacen.service';
import { CrearAlmacenDto,ActualizarAlmacenDto } from './dto/almacen.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('almacen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('almacenes')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  @Get()
  @Roles('almacen', 'mesacontrol', 'admin', 'superAdmin')
  listar() {
    return this.almacenService.listar();
  }

  @Get(':id')
  @Roles('almacen', 'mesacontrol', 'admin', 'superAdmin')
  obtenerPorId(@Param('id') id: string) {
    return this.almacenService.obtenerPorId(id);
  }

  @Post()
  @Roles('admin', 'superAdmin', 'almacen')
  crear(@Body() dto: CrearAlmacenDto, @CurrentUser() user: any) {
    return this.almacenService.crear(dto, user.useremail);
  }

  @Patch(':id')
  @Roles('admin', 'superAdmin', 'almacen')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarAlmacenDto,
    @CurrentUser() user: any,
  ) {
    return this.almacenService.actualizar(id, dto, user.useremail);
  }
}