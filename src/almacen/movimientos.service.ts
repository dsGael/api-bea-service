import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarMovimientoDto } from './dto/movimiento.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la existencia disponible de un tipo de dispositivo en un almacén,
   * sumando entradas/traspasos entrantes y restando salidas/traspasos/asignaciones salientes.
   */
  async calcularExistencia(idAlmacen: string, idDispositivo: string): Promise<number> {
    const resultado = await this.prisma.$queryRaw<{ existencia: number }[]>(
      Prisma.sql`
        SELECT
          COALESCE(SUM(CASE
            WHEN "tipoMovimiento" IN ('entrada', 'traspaso') AND "idAlmacenDestino" = ${idAlmacen}
            THEN cantidad ELSE 0 END), 0)
          -
          COALESCE(SUM(CASE
            WHEN "tipoMovimiento" IN ('salida', 'traspaso', 'asignacion') AND "idAlmacenOrigen" = ${idAlmacen}
            THEN cantidad ELSE 0 END), 0)
          AS existencia
        FROM rel_movimiento
        WHERE "idDispositivo" = ${idDispositivo}
          AND ("idAlmacenOrigen" = ${idAlmacen} OR "idAlmacenDestino" = ${idAlmacen})
      `,
    );

    return Number(resultado[0]?.existencia ?? 0);
  }

  async registrarMovimiento(dto: RegistrarMovimientoDto, usuario: string) {
    this.validarAlmacenes(dto);

    // Para salida/traspaso/asignación, validamos que exista suficiente inventario
    // ANTES de abrir la transacción — igual que hicimos con piezas en tickets
    if (dto.tipoMovimiento !== 'entrada' && dto.idAlmacenOrigen) {
      const existencia = await this.calcularExistencia(dto.idAlmacenOrigen, dto.idDispositivo);
      if (existencia < dto.cantidad) {
        throw new BadRequestException(
          `Existencia insuficiente: hay ${existencia}, se solicitan ${dto.cantidad}`,
        );
      }
    }

    return this.prisma.rel_movimiento.create({
      data: {
        idMovimiento: randomUUID(),
        codigo: randomUUID(),
        fecha: new Date(),
        tipoMovimiento: dto.tipoMovimiento,
        idDispositivo: dto.idDispositivo,
        cantidad: dto.cantidad,
        idAlmacenOrigen: dto.idAlmacenOrigen,
        idAlmacenDestino: dto.idAlmacenDestino,
        numeroSerie: dto.numeroSerie,
        comentario: dto.comentario,
        creadoPor: usuario,
        fechaCreacion: new Date(),
      },
    });
  }

  private validarAlmacenes(dto: RegistrarMovimientoDto) {
    if (dto.tipoMovimiento === 'entrada' && !dto.idAlmacenDestino) {
      throw new BadRequestException('Una entrada requiere idAlmacenDestino');
    }
    if (
      (dto.tipoMovimiento === 'salida' || dto.tipoMovimiento === 'asignacion') &&
      !dto.idAlmacenOrigen
    ) {
      throw new BadRequestException(`Un ${dto.tipoMovimiento} requiere idAlmacenOrigen`);
    }
    if (dto.tipoMovimiento === 'traspaso' && (!dto.idAlmacenOrigen || !dto.idAlmacenDestino)) {
      throw new BadRequestException('Un traspaso requiere idAlmacenOrigen e idAlmacenDestino');
    }
  }

  async listarMovimientos(idAlmacen?: string, idDispositivo?: string) {
    return this.prisma.rel_movimiento.findMany({
      where: {
        ...(idAlmacen && {
          OR: [{ idAlmacenOrigen: idAlmacen }, { idAlmacenDestino: idAlmacen }],
        }),
        ...(idDispositivo && { idDispositivo }),
      },
      orderBy: { fechaCreacion: 'desc' },
      take: 100,
    });
  }
}