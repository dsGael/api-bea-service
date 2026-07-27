import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAsignacionDto } from './dto/asignacion.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class OperacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crearAsignacion(dto: CrearAsignacionDto) {
    return this.prisma.asignacion_diaria.create({
      data: {
        idAsignacion: randomUUID(),
        FOLIO: dto.FOLIO,
        FECHA: new Date(dto.FECHA),
        LINEA: dto.LINEA,
        JORNADA: dto.JORNADA,
        UNIDAD: dto.UNIDAD,
        OPERADOR: dto.OPERADOR,
        NOMBRE_COMPLETO: dto.NOMBRE_COMPLETO,
        HORA_SALIDA: new Date(dto.HORA_SALIDA),
      },
    });
  }

  async listarAsignaciones(fechaIso?: string) {
    // Si no mandan fecha, usamos la de hoy truncada a medianoche
    const fechaFiltro = fechaIso 
      ? new Date(fechaIso) 
      : new Date(new Date().setHours(0, 0, 0, 0));

    return this.prisma.asignacion_diaria.findMany({
      where: {
        FECHA: {
          equals: fechaFiltro,
        }
      },
      orderBy: { HORA_SALIDA: 'asc' }, // Para ver quién sale primero
    });
  }
}