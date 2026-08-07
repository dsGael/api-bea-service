import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEnvioDto, ActualizarEnvioDto } from './dto/envios.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class EnviosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CrearEnvioDto, usuario: string) {
    return this.prisma.envios.create({
      data: {
        idenvio: randomUUID(),
        ...dto,
        quienEnviaRecibe: usuario, // Guardamos quién recibió el paquete
        fechaRecepcion: new Date(),
        fechaMovimiento: new Date(),
      },
    });
  }

  async listar(paqueteria?: string) {
    return this.prisma.envios.findMany({
      where: {
        ...(paqueteria && { paqueteria }),
      },
      orderBy: { fechaRecepcion: 'desc' },
    });
  }

  async obtenerPorId(idenvio: string) {
    const envio = await this.prisma.envios.findUnique({ where: { idenvio } });
    if (!envio) throw new NotFoundException('Envío no encontrado');
    return envio;
  }

  async actualizar(idenvio: string, dto: ActualizarEnvioDto) {
    await this.obtenerPorId(idenvio); // Validamos que exista
    return this.prisma.envios.update({
      where: { idenvio },
      data: {
        ...dto,
        fechaMovimiento: new Date(),
      },
    });
  }

  async actualizarEvidencia(idenvio: string, evidenciasUrl: string[]) {
    await this.obtenerPorId(idenvio);
    return this.prisma.envios.update({
      where: { idenvio },
      data: { imagen1: { push: evidenciasUrl } },
    });
  }

}