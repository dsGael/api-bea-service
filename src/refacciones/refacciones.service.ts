import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimientosService } from '../almacen/movimientos.service';
import { ActualizarEstadoSolicitudDto, CrearSolicitudDto } from './dto/crear-actualizar-solicitud.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class RefaccionesService {
  constructor(
    private prisma: PrismaService,
    private movimientos: MovimientosService,
  ) {}

  crear(dto: CrearSolicitudDto, idTecnico: string) {
    return this.prisma.solicitud_refaccion.create({
      data: {
        idSolicitud: randomUUID(),
        idticket: dto.idticket,
        idDispositivo: dto.idDispositivo,
        cantidad: dto.cantidad ?? 1,
        idTecnico,
        estado: 'pendiente',
        imagen: dto.imagen,
        fecha: new Date(),
      },
    });
  }

  listarPorTecnico(idTecnico: string) {
    return this.prisma.solicitud_refaccion.findMany({
      where: { idTecnico },
      include: { cat_dispositivo_t: true, bin_ticket: true },
      orderBy: { fecha: 'desc' },
    });
  }

  listarTodas(estado?: string) {
    return this.prisma.solicitud_refaccion.findMany({
      where: estado ? { estado } : undefined,
      include: { cat_dispositivo_t: true, bin_ticket: true, cat_tecnicos: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async actualizarEstado(
    idSolicitud: string,
    dto: ActualizarEstadoSolicitudDto,
    usuario: string,
  ) {
    const solicitud = await this.prisma.solicitud_refaccion.findUnique({
      where: { idSolicitud },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    // Si se marca como entregada, además de cambiar el estado, se descuenta
    // inventario real del almacén — mismo patrón de transacción que ya usamos
    if (dto.estado === 'entregada') {
      if (!dto.idAlmacen) {
        throw new BadRequestException('idAlmacen es requerido para marcar como entregada');
      }
      if (!solicitud.idDispositivo) {
        throw new BadRequestException('La solicitud no tiene un dispositivo asociado');
      }

      await this.movimientos.registrarMovimiento(
        {
          tipoMovimiento: 'asignacion',
          idDispositivo: solicitud.idDispositivo,
          cantidad: Number(solicitud.cantidad ?? 1),
          idAlmacenOrigen: dto.idAlmacen,
          comentario: `Entrega de solicitud ${idSolicitud}`,
        },
        usuario,
      );
    }

    return this.prisma.solicitud_refaccion.update({
      where: { idSolicitud },
      data: { estado: dto.estado },
    });
  }
}