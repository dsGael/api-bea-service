import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CrearEnvioDto, ActualizarEnvioDto } from './dto/envios.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MinioService } from 'src/storage/minio.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('envios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService, private readonly minioService:MinioService) {}

  @Post()
  @Roles('almacen', 'mesacontrol', 'admin', 'superadmin')
  crear(@Body() dto: CrearEnvioDto, @CurrentUser() user: any) {
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


    @Patch('evidencias/:id/:guia/:proyecto')
  @UseInterceptors(FilesInterceptor('evidencias'))
  async subirEvidencias(
    @Param('proyecto') proyecto: string,
    @Param('guia') guia: string,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    //  Mapeamos el arreglo de archivos para crear múltiples promesas de subida
    const promesasSubida = files.map(file => {
      const key = `ImagenesEnvios/${proyecto}/${guia}/${Date.now()}-${file.originalname}`;
      return this.minioService.uploadFile(
        'app-media', 
        key, 
        file.buffer, 
        file.mimetype
      );
    });

    const urls = await Promise.all(promesasSubida);
    return this.enviosService.actualizarEvidencia(id, urls);
  }

}