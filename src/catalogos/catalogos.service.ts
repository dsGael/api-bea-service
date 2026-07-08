import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FallaResponseDto } from './dto/falla-response.dto';
import { DispositivoTipoResponseDto } from './dto/dispositivo-tipo-response.dto';
import { ActualizarFallaDto, CrearFallaDto } from './dto/crear-update-falla.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

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


    async listarTiposDispositivo(): Promise<DispositivoTipoResponseDto[]> {
        const tipos = await this.prisma.cat_dispositivo_t.findMany({
        orderBy: { nombre: 'asc' },
        });
        return tipos.map(DispositivoTipoResponseDto.fromPrisma);
    }

    async listarCategorias() {
        return this.prisma.cat_categoria.findMany({
        select: { idCategoria: true, nombre: true, descripcion: true },
        orderBy: { nombre: 'asc' },
        });
    }

    async listarPrioridades() {
        return this.prisma.cat_prioridad.findMany({
        select: { idPrioridad: true, nombre: true },
        orderBy: { idPrioridad: 'asc' },
        });
    }

    async listarEstadosReparacion() {
        return this.prisma.cat_estado_r.findMany({
        select: { idEstadoR: true, nombre: true },
        });
    }

    async listarRutas() {
        return this.prisma.cat_ruta.findMany({
        select: { idRuta: true, nombre: true, longitud: true },
        orderBy: { nombre: 'asc' },
        });
    }
}