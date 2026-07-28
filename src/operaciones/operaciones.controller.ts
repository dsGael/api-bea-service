import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OperacionesService } from './operaciones.service';
import { CrearAsignacionDto } from './dto/asignacion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('operaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operacionesService: OperacionesService) {}

  @Post('asignacion-diaria')
  @Roles('admin', 'superadmin', 'mesacontrol','capturista') // O el rol del despachador
  crear(@Body() dto: CrearAsignacionDto) {
    return this.operacionesService.crearAsignacion(dto);
  }

  @Post('asignaciones/upload-csv')
@Roles('admin', 'superadmin', 'mesacontrol', 'capturista') // O el rol de quien sube el Excel
@UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo en Postman/Frontend
async cargarAsignacionesCSV(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No se envió ningún archivo CSV');
  }
  
  if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
    throw new BadRequestException('El archivo debe ser un formato CSV válido');
  }

  return this.operacionesService.procesarCSV(file.buffer);
}

  @Get('asignacion-diaria')
  @Roles('admin', 'superadmin', 'mesacontrol', 'capturista') // O el rol del despachador
  listarHoy(@Query('fecha') fecha?: string) {
    // Por defecto, que traiga las del día en curso si no le mandan fecha
    return this.operacionesService.listarAsignaciones(fecha);
  }

  @Get('asignacion-diaria/hoy')
  @Roles('admin', 'superadmin', 'mesacontrol', 'capturista') // O el rol del despachador
  listarHoyAsignaciones() {
    return this.operacionesService.asignacionDeHoy();
  }
}