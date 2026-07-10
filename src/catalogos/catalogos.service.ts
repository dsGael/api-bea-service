import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DispositivoTipoResponseDto } from './dto/dispositivo-tipo.dto';
import { ActualizarFallaDto, CrearFallaDto, FallaResponseDto } from './dto/falla.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

    // cat_fallas

    async listarFallas(): Promise<FallaResponseDto[]> {
        const fallas = await this.prisma.cat_falla.findMany({
        orderBy: { nombre: 'asc' },
        });
        return fallas.map(FallaResponseDto.fromPrisma);
    }

    async crearFalla(dto: CrearFallaDto, usuario: string) {
        const falla = await this.prisma.cat_falla.create({
            data: {
            idFalla: randomUUID(),
            nombre: dto.nombre,
            falla: dto.falla,
            descripcionFalla: dto.descripcionFalla,
            idDispositivo: dto.idDispositivo,
            creadoPor: usuario,
            fechaCreacion: new Date(),
            },
        });
        return FallaResponseDto.fromPrisma(falla);
    }

    async actualizarFalla(id: string, dto: ActualizarFallaDto, usuario: string) {
        const falla = await this.prisma.cat_falla.update({
            where: { idFalla: id },
            data: {
            ...(dto.nombre && { nombre: dto.nombre }),
            ...(dto.descripcionFalla && { descripcionFalla: dto.descripcionFalla }),
            modificadoPor: usuario,
            fechaModificacion: new Date(),
            },
        });
        return FallaResponseDto.fromPrisma(falla);
    }


    // cat_dispositivo_t

    async listarTiposDispositivo(): Promise<DispositivoTipoResponseDto[]> {
        const tipos = await this.prisma.cat_dispositivo_t.findMany({
        orderBy: { nombre: 'asc' },
        });
        return tipos.map(DispositivoTipoResponseDto.fromPrisma);
    }

    async crearTipoDispositivo(dto: any, usuario: string) {
        const tipo = await this.prisma.cat_dispositivo_t.create({
            data: {
            idDispositivoT: randomUUID(),
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            tipo: dto.tipo,
            requiereSerie: dto.requiereSerie,
    }})

}

    // cat_categoria

    async listarCategorias() {
        return this.prisma.cat_categoria.findMany({
        select: { idCategoria: true, nombre: true, descripcion: true },
        orderBy: { nombre: 'asc' },
        });
    }

    // cat_prioridad

    async listarPrioridades() {
        return this.prisma.cat_prioridad.findMany({
        select: { idPrioridad: true, nombre: true },
        orderBy: { idPrioridad: 'asc' },
        });
    }

    // cat_estado_r
    async listarEstadosReparacion() {
        return this.prisma.cat_estado_r.findMany({
        select: { idEstadoR: true, nombre: true },
        });
    }

    // cat_ruta
    async listarRutas() {
        return this.prisma.cat_ruta.findMany({
        select: { idRuta: true, nombre: true, longitud: true },
        orderBy: { nombre: 'asc' },
        });
    }
}