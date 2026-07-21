import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimientosService } from '../almacen/movimientos.service';
import {ActualizarEstadoSolicitudDto, CrearSolicitudDto, } from './dto/crear-actualizar-solicitud.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RefaccionesService {
  constructor(
    private prisma: PrismaService,
    private movimientos: MovimientosService,
  ) {}

  crear(dto: CrearSolicitudDto, idEmpleado: string) {
    return this.prisma.solicitud_refaccion.create({
      data: {
        idSolicitud: randomUUID(),
        idticket: dto.idticket,
        idDispositivo: dto.idDispositivo,
        cantidad: dto.cantidad ?? 1,
        idTecnico: idEmpleado, // la columna se sigue llamando idTecnico, ahora guarda idEmpleado
        estado: 'pendiente',
        imagen: dto.imagen,
        fecha: new Date(),
      },
    });
  }

  listarPorTecnico(idEmpleado: string) {
    return this.prisma.solicitud_refaccion.findMany({
      where: { idTecnico: idEmpleado },
      include: { cat_dispositivo_t: true, bin_ticket: true },
      orderBy: { fecha: 'desc' },
    });
  }

  listarTodas(estado?: string) {
    return this.prisma.solicitud_refaccion.findMany({
      where: estado ? { estado } : undefined,
      include: { cat_dispositivo_t: true, bin_ticket: true, cat_empleados: true },
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