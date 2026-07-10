import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChecarDto } from './dto/checar.dto';

@Injectable()
export class ChecadorService {
  constructor(private readonly prisma: PrismaService) {}

  async checar(dto: ChecarDto) {
    // 1. Si mandaron GPS, validamos que esté dentro de la geocerca asignada al técnico
    if (dto.gps) {
      await this.validarGeocerca(dto.idUsuario, dto.gps.lat, dto.gps.lng);
    }

    const idChecador = randomUUID();
    const idgeocerca = dto.gps
      ? await this.obtenerIdGeocercaTecnico(dto.idUsuario)
      : null;

    // 2. Insertamos el checado crudo — el trigger de Postgres calcula
    //    tipo, Movimiento, HoraEntrada/HoraSalida, horasLaboradas, minutos_retardo, etc.
    await this.prisma.checador.create({
      data: {
        idChecador,
        idUsuario: dto.idUsuario,
        nombre: dto.nombre,
        hora: new Date(`1970-01-01T${dto.hora}`), // Prisma necesita un Date para columnas @db.Time
        fecha: new Date(dto.fecha_hora),
        fecha_hora: new Date(dto.fecha_hora),
        gps: dto.gps ? `${dto.gps.lat},${dto.gps.lng}` : null,
        idgeocerca,
        deviceUUID: dto.deviceUUID,
      },
    });

    // 3. Releemos el registro ya procesado por el trigger
    const resultado = await this.prisma.checador.findUnique({ where: { idChecador } });

    return resultado;
  }

  private async obtenerIdGeocercaTecnico(idUsuario: string): Promise<number | null> {
    const usuario = await this.prisma.cat_usuario.findUnique({
      where: { idUsuario },
      select: { idtecnico: true },
    });

    if (!usuario?.idtecnico) return null;

    const tecnico = await this.prisma.cat_tecnicos.findUnique({
      where: { idTecnico: usuario.idtecnico },
      select: { idGeocerca: true },
    });

    return tecnico?.idGeocerca ?? null;
  }

  private async validarGeocerca(idUsuario: string, lat: number, lng: number) {
    const idGeocerca = await this.obtenerIdGeocercaTecnico(idUsuario);

    if (!idGeocerca) {
      // El técnico no tiene geocerca asignada — decides si esto bloquea
      // o solo se registra sin validar. Por ahora, dejamos pasar.
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