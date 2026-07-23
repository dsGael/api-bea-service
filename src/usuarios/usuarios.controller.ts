import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CrearEmpleadoDto, ActualizarEmpleadoDto,CambiarPasswordDto,CambiarPerfilDto } from './dto/crear-actualizar-empleado.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Roles('superAdmin', 'admin')
  listar() {
    return this.usuariosService.listar();
  }

  @Get('tecnicos')
  @Roles('superAdmin', 'admin', 'mesacontrol', 'supervisor', 'almacen')
  listarTecnicos() {
    return this.usuariosService.listarTecnicos();
  }

  @Get(':id')
  @Roles('superAdmin', 'admin')
  obtenerPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Post()
  @Roles('superAdmin', 'admin')
  crear(@Body() dto: CrearEmpleadoDto, @CurrentUser() user: any) {
    return this.usuariosService.crear(dto, user.idUsuarioApp);
  }

  @Patch(':id')
  @Roles('superAdmin', 'admin')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEmpleadoDto,
    @CurrentUser() user: any,
  ) {
    return this.usuariosService.actualizar(id, dto, user.idUsuarioApp);
  }

  @Patch('cuenta/:idUsuarioApp/password')
  @Roles('superAdmin', 'admin')
  cambiarPassword(
    @Param('idUsuarioApp') idUsuarioApp: string,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.usuariosService.cambiarPassword(idUsuarioApp, dto);
  }

  @Patch('cuenta/:idUsuarioApp/perfil')
  @Roles('superAdmin')
  cambiarPerfil(
    @Param('idUsuarioApp') idUsuarioApp: string,
    @Body() dto: CambiarPerfilDto,
  ) {
    return this.usuariosService.cambiarPerfil(idUsuarioApp, dto);
  }

  @Patch(':id/desactivar')
  @Roles('superAdmin')
  desactivar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usuariosService.desactivar(id, user.idUsuarioApp);
  }

  @Patch(':id/reactivar')
  @Roles('superAdmin')
  reactivar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usuariosService.reactivar(id, user.idUsuarioApp);
  }
}