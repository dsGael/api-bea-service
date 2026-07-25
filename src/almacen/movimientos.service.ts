import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarMovimientoDto } from './dto/movimiento.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la existencia evaluando la partida doble:
   * Todo lo que te llegó (Destino) menos todo lo que mandaste (Origen)
   */
  async calcularExistencia(idAlmacen: string, idDispositivo: string): Promise<number> {
    const resultado = await this.prisma.$queryRaw<{ existencia: number }[]>(
      Prisma.sql`
        SELECT 
          COALESCE(SUM(CASE WHEN "idAlmacenDestino" = ${idAlmacen} THEN cantidad ELSE 0 END), 0) 
          - 
          COALESCE(SUM(CASE WHEN "idAlmacenOrigen" = ${idAlmacen} THEN cantidad ELSE 0 END), 0) 
        AS existencia
        FROM rel_movimiento
        WHERE "idDispositivo" = ${idDispositivo}
          AND ("idAlmacenOrigen" = ${idAlmacen} OR "idAlmacenDestino" = ${idAlmacen})
      `,
    );

    return Number(resultado[0]?.existencia ?? 0);
  }

  async registrarMovimiento(dto: RegistrarMovimientoDto, usuario: string) {
    // 1. Validar que no se manden piezas al mismo lugar
    if (dto.idAlmacenOrigen === dto.idAlmacenDestino) {
      throw new BadRequestException('El almacén de origen y destino no pueden ser el mismo');
    }

    // 2. Validar que el origen tenga suficientes piezas (a menos que el origen sea un proveedor externo/compras)
    // Asumiendo que el ID del almacén de proveedores es diferente a los tuyos, si tienes
    // una forma de identificarlo, podrías saltar esta regla. Por ahora validamos todos.
    const existencia = await this.calcularExistencia(dto.idAlmacenOrigen, dto.idDispositivo);
    
    // Si tu almacén virtual de "Proveedores" o "Inventario Inicial" siempre permite sacar, 
    // podrías agregar una excepción aquí (ej. if (dto.idAlmacenOrigen !== 'ID_PROVEEDOR'))
    if (existencia < dto.cantidad) {
      throw new BadRequestException(
        `Existencia insuficiente en origen: hay ${existencia}, se solicitan ${dto.cantidad}`,
      );
    }

    // 3. Registrar el movimiento
    return this.prisma.rel_movimiento.create({
      data: {
        idMovimiento: randomUUID(),
        codigo: randomUUID(), // codigo basado en contador, preguntar a beto
        fecha: new Date(),
        tipoMovimiento: dto.tipoMovimiento, // Lo guardamos solo para estadística/filtros
        idDispositivo: dto.idDispositivo,
        cantidad: dto.cantidad,
        idAlmacenOrigen: dto.idAlmacenOrigen,
        idAlmacenDestino: dto.idAlmacenDestino,
        numeroSerie: dto.numeroSerie,
        imei1: dto.imei1,
        imei2: dto.imei2,
        comentario: dto.comentario,
        creadoPor: usuario,
        fechaCreacion: new Date(),
      },
    });
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