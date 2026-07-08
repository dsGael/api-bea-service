import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CrearFallaDto,ActualizarFallaDto } from './dto/crear-update-falla.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';




@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('fallas')
    @ApiOperation({ summary: 'Lista de fallas registradas para diagnóstico' })
    listarFallas() {
        return this.catalogosService.listarFallas();
    }

    @Post('fallas')
    @UseGuards(RolesGuard)
    @Roles('superAdmin', 'admin')
    crearFalla(@Body() dto: CrearFallaDto, @CurrentUser() user: any) {
    return this.catalogosService.crearFalla(dto, user.useremail);
    }
    
    @Patch('fallas/:id')
    @UseGuards(RolesGuard)
    @Roles('superAdmin', 'admin')
    actualizarFalla(
    @Param('id') id: string,
    @Body() dto:ActualizarFallaDto,
    @CurrentUser() user: any,
    ) {
    return this.catalogosService.actualizarFalla(id, dto, user.useremail);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('tipos-dispositivo')
    @ApiOperation({ summary: 'Tipos de dispositivo (MDVR, cámara, GPS, torniquete, etc.)' })
    listarTiposDispositivo() {
        return this.catalogosService.listarTiposDispositivo();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('categorias')
    listarCategorias() {
        return this.catalogosService.listarCategorias();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('prioridades')
    listarPrioridades() {
        return this.catalogosService.listarPrioridades();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('estados-reparacion')
    listarEstadosReparacion() {
        return this.catalogosService.listarEstadosReparacion();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // 5 minutos
    @Get('rutas')
    listarRutas() {
        return this.catalogosService.listarRutas();
    }
}