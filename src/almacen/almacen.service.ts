import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAlmacenDto,ActualizarAlmacenDto } from './dto/almacen.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AlmacenService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.cat_almacen.findMany({ orderBy: { nombre: 'asc' } });
  }

  async obtenerPorId(idAlmacen: string) {
    const almacen = await this.prisma.cat_almacen.findUnique({ where: { idAlmacen } });
    if (!almacen) throw new NotFoundException('Almacén no encontrado');
    return almacen;
  }

  crear(dto: CrearAlmacenDto, creadoPor: string) {
    return this.prisma.cat_almacen.create({
      data: {
        idAlmacen: randomUUID(),
        nombre: dto.nombre,
        ubicacion: dto.ubicacion,
        responsable: dto.responsable,
        creadoPor,
        fechaCreacion: new Date(),
      },
    });
  }

  async actualizar(idAlmacen: string, dto: ActualizarAlmacenDto, modificadoPor: string) {
    await this.obtenerPorId(idAlmacen);
    return this.prisma.cat_almacen.update({
      where: { idAlmacen },
      data: { ...dto, modificadoPor, fechaModificacion: new Date() },
    });
  }
}