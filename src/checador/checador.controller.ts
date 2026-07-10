import { Controller, Post, Get, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChecadorService } from './checador.service';
import { ChecarDto } from './dto/checar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('checador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checador')
export class ChecadorController {
  constructor(private readonly checadorService: ChecadorService) {}

  @Post()
  @Roles('tecnicojr', 'tecnicosinior', 'mesacontrol', 'supervisor', 'admin', 'superadmin')
  checar(@Body() dto: ChecarDto) {
    return this.checadorService.checar(dto);
  }

  @Get('hoy')
  @Roles('mesacontrol', 'supervisor', 'admin', 'superadmin')
  listarHoy() {
    return this.checadorService.listarHoy();
  }

  @Get(':idUsuario')
  @Roles('mesacontrol', 'supervisor', 'admin', 'superadmin')
  listarPorUsuario(
    @Param('idUsuario') idUsuario: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.checadorService.listarPorUsuario(idUsuario, desde, hasta);
  }
}