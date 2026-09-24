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
  const almacen = await this.prisma.cat_almacen.findUnique({
    where: { idAlmacen },
    include: {
      cat_dispositivo_cat_dispositivo_idAlmacenActualTocat_almacen: {
        include: { cat_dispositivo_t: true },
      },
      rel_movimiento_rel_movimiento_idAlmacenOrigenTocat_almacen: {
        take: 20,
        orderBy: { fechaCreacion: 'desc' },
        include: { cat_dispositivo_t: true },
      },
      rel_movimiento_rel_movimiento_idAlmacenDestinoTocat_almacen: {
        take: 20,
        orderBy: { fechaCreacion: 'desc' },
        include: { cat_dispositivo_t: true },
      },
    },
  });

  if (!almacen) throw new NotFoundException('Almacén no encontrado');

  const {
    cat_dispositivo_cat_dispositivo_idAlmacenActualTocat_almacen: dispositivos,
    rel_movimiento_rel_movimiento_idAlmacenOrigenTocat_almacen: movimientosSalida,
    rel_movimiento_rel_movimiento_idAlmacenDestinoTocat_almacen: movimientosEntrada,
    ...resto
  } = almacen;

  const remapMovimiento = (m: (typeof movimientosSalida)[number]) => {
    const { cat_dispositivo_t: dispositivo, ...restoMov } = m;
    return { ...restoMov, dispositivo };
  };

  const movimientos = [...movimientosSalida, ...movimientosEntrada]
    .map(remapMovimiento)
    .sort((a, b) => (b.fechaCreacion?.getTime() ?? 0) - (a.fechaCreacion?.getTime() ?? 0))
    .slice(0, 20);

  return { ...resto, dispositivos, movimientos };
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