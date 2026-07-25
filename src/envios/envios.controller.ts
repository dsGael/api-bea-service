import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CrearEnvioDto, ActualizarEnvioDto } from './dto/envios.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('envios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  crear(@Body() dto: CrearEnvioDto, @CurrentUser() user: any) {
    // Usamos useremail o el nombre del usuario según cómo venga tu token
    return this.enviosService.crear(dto, user.useremail);
  }

  @Get()
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  listar(@Query('paqueteria') paqueteria?: string) {
    return this.enviosService.listar(paqueteria);
  }

  @Get(':id')
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  obtenerPorId(@Param('id') id: string) {
    return this.enviosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEnvioDto
  ) {
    return this.enviosService.actualizar(id, dto);
  }
}