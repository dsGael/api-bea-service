import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearReparacionDto, ActualizarReparacionDto } from './dto/reparacion.dto';

@Injectable()
export class LaboratorioService {
  constructor(private readonly prisma: PrismaService) {}

  async crearReparacion(dto: CrearReparacionDto, idUsuarioAsigna: string) {
    return this.prisma.lab_reparacion.create({
      data: {
        ...dto,
        id_usuario_asigna: idUsuarioAsigna, // El usuario que registró el ingreso
        estatus: 'PENDIENTE',
      },
    });
  }

  async listarReparaciones() {
    return this.prisma.lab_reparacion.findMany({
      include: {
        cat_dispositivo_t: true, // Trae los datos del tipo de dispositivo
        cat_tecnicos: true, // Trae los datos del técnico
      },
      orderBy: { fecha_ingreso: 'desc' },
    });
  }

    async obtenerPorId(id: string) {
    return this.prisma.lab_reparacion.findUnique({
        where: { id_reparacion: id },
        include: {
            cat_dispositivo_t: true,
            cat_tecnicos: true,
        },
    });
  }

  async actualizar(id: string, dto: ActualizarReparacionDto) {
    return this.prisma.lab_reparacion.update({
      where: { id_reparacion: id },
      data: { ...dto },
    });
  }

  async actualizarEvidencia(id: string, evidenciasUrl: string[]) {
    return this.prisma.lab_reparacion.update({
      where: { id_reparacion: id },
      data: { evidencia_1: { push: evidenciasUrl } },
    });
  }


  
}