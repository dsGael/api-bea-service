import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RefaccionesService } from './refacciones.service';
import { CrearSolicitudDto, ActualizarEstadoSolicitudDto } from './dto/crear-actualizar-solicitud.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MinioService } from '../storage/minio.service';

@ApiTags('refacciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('refacciones')
export class RefaccionesController {
  constructor(
    private readonly refaccionesService: RefaccionesService,
    private readonly minioService: MinioService,
  ) {}

  // 1. EL TÉCNICO PIDE LA PIEZA (JSON normal)
  @Post()
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol', 'admin', 'superadmin')
  crear(@Body() dto: CrearSolicitudDto, @CurrentUser() user: any) {
    return this.refaccionesService.crear(dto, user.idUsuarioApp);
  }

  // 2. EL ALMACÉN SUBE LA FOTO DE EVIDENCIA DE ENTREGA (FormData)
  @Patch(':id/evidencias/:folio')
  @Roles('almacen', 'admin', 'superadmin')
  @UseInterceptors(FilesInterceptor('evidencias'))
  @ApiConsumes('multipart/form-data')
  async subirEvidencias(
    @Param('id') id: string,
    @Param('folio') folio: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) return { message: 'No se enviaron archivos' };

    const promesasSubida = files.map(file => {
      const nombreLimpio = file.originalname.replace(/\s+/g, '_');
      const key = `ImagenesRefacciones/${folio}/${Date.now()}-${nombreLimpio}`;
      return this.minioService.uploadFile('app-media', key, file.buffer, file.mimetype);
    });

    const urls = await Promise.all(promesasSubida);
    return this.refaccionesService.actualizarEvidencia(id, urls);
  }

  // 3. EL ALMACÉN MARCA COMO ENTREGADA (JSON normal)
  @Patch(':id/estado')
  @Roles('almacen', 'admin', 'superadmin')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoSolicitudDto,
    @CurrentUser() user: any,
  ) {
    return this.refaccionesService.actualizarEstado(id, dto, user.idUsuarioApp);
  }

  @Get()
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  listarTodas(@Query('estado') estado?: string) {
    return this.refaccionesService.listarTodas(estado);
  }

  @Get(':id')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol', 'admin', 'superadmin')
  obtenerPorId(@Param('id') id: string) {
    return this.refaccionesService.obtenerPorId(id);
  }

  @Get('ticket/:id')
  @Roles('tecnicojr', 'tecnicosinior', 'almacen', 'mesacontrol', 'admin', 'superadmin')
  listarPorTicket(@Param('id') id: string) {
    return this.refaccionesService.listarPorTicket(id);
  }
}