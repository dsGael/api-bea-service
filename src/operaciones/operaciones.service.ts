import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAsignacionDto } from './dto/asignacion.dto';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import csvParser from 'csv-parser';

@Injectable()
export class OperacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async procesarCSV(fileBuffer: Buffer): Promise<{ insertados: number; mensaje: string }> {
    const registros: any[] = [];
    
    // Convertimos el Buffer a un Stream de lectura para que csv-parser pueda leerlo
    const stream = Readable.from(fileBuffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser({ separator: ',' })) // Cambia a ';' si el Excel en español lo exporta con punto y coma
        .on('data', (row) => {
          // 'row' representa una fila del CSV. 
          // Asegúrate de que las cabeceras del CSV coincidan con estos nombres.
          registros.push({
            idAsignacion: randomUUID(),
            FOLIO: row.FOLIO ? Number.parseInt(row.FOLIO, 10) : null,
            FECHA: row.FECHA ? new Date(row.FECHA) : null,
            LINEA: row.LINEA ? Number.parseInt(row.LINEA, 10) : null,
            JORNADA: row.JORNADA ? Number.parseInt(row.JORNADA, 10) : null,
            UNIDAD: row.UNIDAD || null,
            OPERADOR: row.OPERADOR || null,
            NOMBRE_COMPLETO: row.NOMBRE_COMPLETO || null,
            // Asumiendo que HORA_SALIDA viene combinada o en formato que JS entienda
            HORA_SALIDA: row.HORA_SALIDA ? new Date(`${row.FECHA}T${row.HORA_SALIDA}`) : null,
          });
        })
        .on('end', async () => {
          try {
            if (registros.length === 0) {
              return reject(new BadRequestException('El archivo CSV está vacío'));
            }

            // Inserción masiva ultra rápida con Prisma
            const resultado = await this.prisma.asignacion_diaria.createMany({
              data: registros,
              skipDuplicates: true, // Evita crashear si por error suben un registro con el mismo ID
            });

            resolve({
              insertados: resultado.count,
              mensaje: `Se insertaron ${resultado.count} asignaciones correctamente.`,
            });
          } catch (error) {
            const mensajeError = error instanceof Error
              ? error.message
              : 'Error al guardar en base de datos. Verifica el formato de tus fechas y números.';

            reject(error instanceof BadRequestException ? error : new BadRequestException(mensajeError));
          }
        })
        .on('error', (error) => reject(new BadRequestException('Error al leer el archivo CSV')));
    });
  }

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