import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CrearEmpleadoDto, ActualizarEmpleadoDto,CambiarPasswordDto,CambiarPerfilDto } from './dto/crear-actualizar-empleado.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor} from '@nestjs/platform-express';
import { MinioService } from 'src/storage/minio.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService, private readonly minioService: MinioService) {}

  @Get()
  @Roles('superadmin', 'admin')
  listar() {
    return this.usuariosService.listar();
  }

  @Get('tecnicos')
  @Roles('superadmin', 'admin', 'mesacontrol', 'supervisor', 'almacen')
  listarTecnicos() {
    return this.usuariosService.listarTecnicos();
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  obtenerPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Post()
  @Roles('superadmin', 'admin')
  crear(@Body() dto: CrearEmpleadoDto, @CurrentUser() user: any) {
    return this.usuariosService.crear(dto, user.idUsuarioApp);
  }

  @Patch(':id')
  @Roles('superadmin', 'admin')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEmpleadoDto,
    @CurrentUser() user: any,
  ) {
    return this.usuariosService.actualizar(id, dto, user.idUsuarioApp);
  }

  @Patch('cuenta/:idUsuarioApp/password')
  @Roles('superadmin', 'admin')
  cambiarPassword(
    @Param('idUsuarioApp') idUsuarioApp: string,
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.usuariosService.cambiarPassword(idUsuarioApp, dto);
  }

  @Patch('cuenta/:idUsuarioApp/perfil')
  @Roles('superadmin')
  cambiarPerfil(
    @Param('idUsuarioApp') idUsuarioApp: string,
    @Body() dto: CambiarPerfilDto,
  ) {
    return this.usuariosService.cambiarPerfil(idUsuarioApp, dto);
  }

  @Patch(':id/desactivar')
  @Roles('superadmin')
  desactivar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usuariosService.desactivar(id, user.idUsuarioApp);
  }

  @Patch(':id/reactivar')
  @Roles('superadmin')
  reactivar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usuariosService.reactivar(id, user.idUsuarioApp);
  }

   @Patch('foto/:id')
  @UseInterceptors(FileInterceptor('foto'))
  async subirEvidencias(
    @Param('id') id: string,
    @UploadedFiles() file: Express.Multer.File,
  ) {

    const key = `ImagenesEmpleados/${id}/${Date.now()}-${file.originalname}`;
    const url= this.minioService.uploadFile(
        'app-media', 
        key, 
        file.buffer, 
        file.mimetype
      );

    return this.usuariosService.subirFotoPerfil(id, await url);
  }

}