import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AjusteChecadaDto, ChecarDto, SyncChecadasDto } from './dto/checar.dto';

@Injectable()
export class ChecadorService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.checador.findMany({
      orderBy: { fecha_hora: 'desc' },
    });
  }
  
  async checar(dto: ChecarDto) {
    if (dto.gps) {
      await this.validarGeocerca(dto.idUsuario, dto.gps.lat, dto.gps.lng);
    }

    const idChecador = randomUUID();
    const idgeocerca = dto.gps
      ? await this.obtenerIdGeocerca(dto.idUsuario)
      : null;

    await this.prisma.checador.create({
      data: {
        idChecador,
        idUsuario: dto.idUsuario, // ahora es literal cat_usuarios_app.idUsuarioApp
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

 
  private async obtenerIdGeocerca(idUsuarioApp: string): Promise<number | null> {
    const cuenta = await this.prisma.cat_usuarios_app.findUnique({
      where: { idUsuarioApp },
      select: { idGeocerca: true },
    });
    return cuenta?.idGeocerca ?? null;
  }

  private async validarGeocerca(idUsuarioApp: string, lat: number, lng: number) {
    const idGeocerca = await this.obtenerIdGeocerca(idUsuarioApp);

    if (!idGeocerca) return; // sin geocerca asignada, se deja pasar sin validar

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
          hasta && { fecha_hora: { gte: new Date(desde), lte: new Date(hasta) } }),
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

async listarMes(mes: number, anio: number) {
  // Construimos el primer día del mes a las 00:00:00 UTC
  const inicioMes = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
  
  // Construimos el último día del mes a las 23:59:59 UTC
  // El día '0' automáticamente nos da el último día del mes configurado
  const finMes = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));

  console.log(`Buscando fecha desde: ${inicioMes.toISOString()} hasta ${finMes.toISOString()}`);

  return this.prisma.checador.findMany({
    where: { 
      fecha: { 
        gte: inicioMes, 
        lte: finMes 
      } 
    },
    orderBy: { 
      fecha: 'desc' 
    },
  });
}

  async listarHoyPorUsuario(idUsuario: string) {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    return this.prisma.checador.findMany({
      where: { idUsuario, fecha_hora: { gte: inicioDia } },
      orderBy: { fecha_hora: 'desc' },
    });
  }
  

  async listarRango(desde: string, hasta: string) {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);
    return this.prisma.checador.findMany({
      where: { fecha_hora: { gte: fechaInicio, lte: fechaFin } },
      orderBy: { fecha_hora: 'desc' },
    });
  
  }


  async misAsistenciasActuales(idUsuario: string) {
    const hoy = new Date();
    const anio = hoy.getUTCFullYear();
    const mes = hoy.getUTCMonth(); // Enero es 0, Julio es 6

    // Primer día del mes actual a las 00:00:00 UTC
    const inicioMes = new Date(Date.UTC(anio, mes, 1, 0, 0, 0, 0));
    
    // Último día del mes actual a las 23:59:59 UTC
    const finMes = new Date(Date.UTC(anio, mes + 1, 0, 23, 59, 59, 999));

    return this.prisma.checador.findMany({
      where: {
        idUsuario: idUsuario, // Equivalente a ANY(SELECT(...))
        fecha: {
          gte: inicioMes,     // Equivalente a MONTH/YEAR(TODAY())
          lte: finMes
        }
      },
      orderBy: { 
        fecha_hora: 'desc' 
      },
    });
  }


  // 1. ESTADO ACTUAL DEL USUARIO
  async obtenerEstadoActual(idUsuario: string) {
    const ultimoRegistro = await this.prisma.checador.findFirst({
      where: { idUsuario },
      orderBy: { fecha_hora: 'desc' },
    });

    if (!ultimoRegistro) return { estado: 'Sin registros' };

    return {
      trabajando: ultimoRegistro.estado === 'Abierta',
      ultimoMovimiento: ultimoRegistro.Movimiento,
      horaRegistro: ultimoRegistro.hora,
      tipo: ultimoRegistro.tipo,
    };
  }

  // 2. ESTADÍSTICAS Y MÉTRICAS (Rango de fechas UTC)
  async obtenerMetricas(desde: string, hasta: string) {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    const metricas = await this.prisma.checador.aggregate({
      _sum: {
        horasLaboradas: true,
        minutos_retardo: true,
        HorasExtras: true,
      },
      _count: {
        idChecador: true, // Total de checadas en el periodo
      },
      where: {
        fecha: { gte: fechaInicio, lte: fechaFin },
      },
    });

    return metricas;
  }

  // 3. AJUSTE MANUAL
  async ajustarChecadaManual(idChecador: string, dto: AjusteChecadaDto) {
    return this.prisma.checador.update({
      where: { idChecador },
      data: {
        ...dto,
        // Opcional: Podrías forzar un cambio de estado para saber que fue editado
        estado: 'Editado Manualmente', 
      },
    });
  }

  // 4. RESUMEN QUINCENAL / NÓMINA
  async resumenQuincenal(idUsuario: string, quincena: number, mes: number, anio: number) {
    // Calculamos el inicio y fin según la quincena (1 o 2)
    const diaInicio = quincena === 1 ? 1 : 16;
    const diaFin = quincena === 1 ? 15 : 0; // '0' da el último día del mes si adelantamos el mes en Date

    // Mes en JS es index-0 (enero = 0), por eso (mes - 1) para inicio, pero usamos 'mes' para el día 0 del fin
    const fechaInicio = new Date(Date.UTC(anio, mes - 1, diaInicio, 0, 0, 0, 0));
    const fechaFin = quincena === 1 
      ? new Date(Date.UTC(anio, mes - 1, diaFin, 23, 59, 59, 999))
      : new Date(Date.UTC(anio, mes, diaFin, 23, 59, 59, 999));

    return this.prisma.checador.findMany({
      where: {
        idUsuario,
        fecha: { gte: fechaInicio, lte: fechaFin },
      },
      orderBy: { fecha_hora: 'asc' }, // Ascendente es mejor para leer reportes de nómina
    });
  }

  // 5. HISTORIAL DE INCONSISTENCIAS
  async listarInconsistencias(desde: string, hasta: string) {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    return this.prisma.checador.findMany({
      where: {
        fecha: { gte: fechaInicio, lte: fechaFin },
        OR: [
          { minutos_retardo: { gt: 0 } },
          { Movimiento: 'cerrada automatica' },
          { HorasExtras: { gt: 0 } }
        ]
      },
      orderBy: { fecha_hora: 'desc' },
      include: {
        cat_usuarios_app: {
          select: { useremail: true } // Traemos un dato extra del usuario para identificarlo
        }
      }
    });
  }


  async sincronizarOffline(dto: SyncChecadasDto) {
    const checadasOrdenadas = dto.checadas.toSorted((a, b) => {
      return new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime();
    });

    const resultados = {
      procesadas: 0,
      exitosas: [] as string[],
      fallidas: [] as any[],
    };

    for (const checada of checadasOrdenadas) {
      try {
        // Reutilizamos tu método principal "checar"
        const registro = await this.checar(checada);

        if (!registro) {
          throw new Error('No se pudo registrar la checada');
        }

        resultados.exitosas.push(registro.idChecador);
        resultados.procesadas++;
      } catch (error) {
        // Si falla por geocerca o validación, lo anotamos pero continuamos con las demás
        const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
        resultados.fallidas.push({
          fecha_hora: checada.fecha_hora,
          error: mensajeError,
        });
      }
    }

    return resultados;
  }

}