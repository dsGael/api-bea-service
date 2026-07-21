import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChecarDto } from './dto/checar.dto';

@Injectable()
export class ChecadorService {
  constructor(private prisma: PrismaService) {}

  async checar(dto: ChecarDto) {
    if (dto.gps) {
      await this.validarGeocerca(dto.idUsuario, dto.gps.lat, dto.gps.lng);
    }

    const idChecador = randomUUID();
    const idgeocerca = dto.gps
      ? await this.obtenerIdGeocercaEmpleado(dto.idUsuario)
      : null;

    await this.prisma.checador.create({
      data: {
        idChecador,
        idUsuario: dto.idUsuario, // ahora es literal cat_usuarios.idUsuario
        nombre: dto.nombre,
        hora: new Date(`1970-01-01T${dto.hora}`),
        fecha: new Date(dto.fecha_hora),
        fecha_hora: new Date(dto.fecha_hora),
        gps: dto.gps ? `${dto.gps.lat},${dto.gps.lng}` : null,
        idgeocerca,
        deviceUUID: dto.deviceUUID,
      },
    });

    return this.prisma.checador.findUnique({ where: { idChecador } });
  }

  /**
   * Antes eran dos saltos: cat_usuario -> idtecnico -> cat_tecnicos.idGeocerca.
   * Con el schema nuevo, cat_usuarios ya está vinculado 1:1 a cat_empleados,
   * así que es un solo join.
   */
  private async obtenerIdGeocercaEmpleado(idUsuario: string): Promise<number | null> {
    const usuario = await this.prisma.cat_usuarios.findUnique({
      where: { idUsuario },
      select: { cat_empleados: { select: { idGeocerca: true } } },
    });

    return usuario?.cat_empleados?.idGeocerca ?? null;
  }

  private async validarGeocerca(idUsuario: string, lat: number, lng: number) {
    const idGeocerca = await this.obtenerIdGeocercaEmpleado(idUsuario);

    if (!idGeocerca) {
      // El empleado no tiene geocerca asignada — se deja pasar sin validar
      return;
    }

    const resultado = await this.prisma.$queryRaw<{ dentro: boolean }[]>(
      Prisma.sql`
        SELECT ST_DWithin(
          ubicacion,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          radio
        ) as dentro
        FROM geocercas
        WHERE "idGeocerca" = ${idGeocerca}
      `,
    );

    const dentro = resultado[0]?.dentro;

    if (dentro === undefined) {
      throw new BadRequestException('Geocerca asignada no encontrada');
    }
    if (!dentro) {
      throw new ForbiddenException('Fuera del área permitida para checar');
    }
  }

  async listarPorUsuario(idUsuario: string, desde?: string, hasta?: string) {
    return this.prisma.checador.findMany({
      where: {
        idUsuario,
        ...(desde &&
          hasta && {
            fecha_hora: { gte: new Date(desde), lte: new Date(hasta) },
          }),
      },
      orderBy: { fecha_hora: 'desc' },
    });
  }

  async listarHoy() {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    return this.prisma.checador.findMany({
      where: { fecha_hora: { gte: inicioDia } },
      orderBy: { fecha_hora: 'desc' },
    });
  }
}