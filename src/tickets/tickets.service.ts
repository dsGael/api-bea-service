import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogosService } from '../catalogos/catalogos.service';
import { CrearTicketDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto } from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';
import { Prisma } from '@prisma/client';

const ESTADO_CERRADO_ID = 'FIN5c61e7'; 

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogos: CatalogosService,
  ) {}

 async listarTodos(query: ListarTicketsQueryDto) {
  const { page = 1, limit = 20, ...filtros } = query;

  const where = {
    ...(filtros.estatusrep && { estatusrep: filtros.estatusrep }),
    ...(filtros.idautobus && { idautobus: filtros.idautobus }),
    ...(filtros.idruta && { idruta: filtros.idruta }),
    ...(filtros.idtecnico && { idtecnico: filtros.idtecnico }),
    ...(filtros.idprioridad && { idprioridad: filtros.idprioridad }),
  };

  const [tickets, total] = await this.prisma.$transaction([
    this.prisma.bin_ticket.findMany({
      where,
      include: {
        cat_falla: true,
        cat_autobus: true,
        cat_prioridad: true,
        cat_estado_r: true,
        cat_tecnicos: true,
      },
      orderBy: { fechacreacion: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    this.prisma.bin_ticket.count({ where }),
  ]);

  return {
    data: tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


 private async resolverIdEmpresa(idempresa?: string, idreporta?: string): Promise<string> {
    // Si el front mandó la empresa, usamos esa
    if (idempresa) return idempresa;

    // Si no, la deducimos de quien reporta
    if (idreporta) {
      const reporta = await this.prisma.cat_reporta.findUnique({
        where: { idReporta: idreporta },
        select: { idEmpresa: true },
      });
      if (reporta?.idEmpresa) return reporta.idEmpresa;
    }

    throw new BadRequestException('El idempresa es obligatorio.');
  }

  private async resolverIdRuta(idruta?: string, idautobus?: string): Promise<string | undefined> {
    // Si el front mandó la ruta, usamos esa
    if (idruta) return idruta;
    if (!idautobus) return undefined;

    // Buscamos el autobús
    const autobus = await this.prisma.cat_autobus.findUnique({
      where: { idAutobus: idautobus },
      select: { numeroEconomico: true },
    });
    if (!autobus) return undefined;

    // Buscamos la asignación
    const ahora = new Date();
    const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const finDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);

    const asignacion = await this.prisma.asignacion_diaria.findFirst({
      where: {
        UNIDAD: autobus.numeroEconomico,
        FECHA: { gte: inicioDia, lte: finDia },
      },
    });
    if (!asignacion) return undefined;

    // Buscamos la ruta
    const ruta = await this.prisma.cat_ruta.findFirst({
      where: { nombre: asignacion.LINEA?.toString() },
      select: { idRuta: true },
    });

    return ruta?.idRuta;
  }


  async crearTicket(dto: CrearTicketDto, usuario: string) {
    const idEmpresaFinal = await this.resolverIdEmpresa(dto.idempresa, dto.idreporta);
    const idRutaFinal = await this.resolverIdRuta(dto.idruta, dto.idautobus);

    const ahora = new Date();
    const soloFecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    try {
      return await this.prisma.bin_ticket.create({
        data: {
          idticket: randomUUID(),
          fecha: soloFecha,
          fechahora: ahora,
          idautobus: dto.idautobus,
          idruta: idRutaFinal,
          idoperador: dto.idoperador,
          iddispositivo: dto.iddispositivo,
          idfalla: dto.idfalla,
          idcategoria: dto.idcategoria,
          idprioridad: dto.idprioridad,
          idreporta: dto.idreporta,
          comentarios: dto.comentarios,
          estatusrep: 'ABI9e9uqgr',
          creadopor: usuario,
          fechacreacion: ahora,
          idempresa: idEmpresaFinal,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          `Error de integridad: El identificador proporcionado no existe en el catálogo relacionado. (Referencia: ${error.meta?.field_name})`
        );
      }
      throw error;
    }
  }


  async listarPorTecnico(idtecnico: string) {
    return this.prisma.bin_ticket.findMany({
      where: {
        idtecnico,
        estatusrep: { not: 'cerrado' },
      },
      include: {
        cat_falla: true,
        cat_autobus: true,
        cat_prioridad: true,
        cat_estado_r: true,
      },
      orderBy: { fechacreacion: 'desc' },
    });
  }

  async obtenerPorId(idticket: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({
      where: { idticket },
      include: {
        cat_falla: true,
        cat_autobus: true,
        cat_categoria: true,
        cat_prioridad: true,
        cat_estado_r: true,
        cat_tecnicos: true,
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async asignarTecnico(idticket: string, dto: AsignarTecnicoDto, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: {
        idtecnico: dto.idtecnico,
        estatusrep: 'en_proceso',
        modificadopor: usuario,
        fechamodificacion: new Date(),
      },
    });
  }

  async cerrarTicket(idticket: string, dto: CerrarTicketDto, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    
    // Validar usando tu constante o el string exacto de la base de datos
    if (ticket.estatusrep === 'FIN5c61e7' || ticket.estatusrep === 'cerrado') {
      throw new BadRequestException('El ticket ya está cerrado');
    }

    // 1. Instanciamos la fecha una SOLA VEZ para perfecta sincronía
    const ahora = new Date();

    // Transacción: el ticket se cierra Y se crea el registro de detalle
    return this.prisma.$transaction(async (tx) => {
      
      const ticketCerrado = await tx.bin_ticket.update({
        where: { idticket },
        data: {
          estatusrep: 'FIN5c61e7', // O 'cerrado', dependiendo de tu catálogo real
          fecharesolucion: ahora,
          modificadopor: usuario,
          fechamodificacion: ahora,
        },
      });

      await tx.bin_ticket_detail.create({
        data: {
          idDetalle: randomUUID(),
          idTicket: idticket,
          fechaHora: ahora,
          folio: ticket.folio,
          idAutobus: ticket.idautobus,
          idRuta: ticket.idruta,
          idDispositivo: ticket.iddispositivo,
          idFalla: ticket.idfalla,
          idCategoria: ticket.idcategoria,
          idTecnico: ticket.idtecnico,
          // Datos que vienen del DTO:
          Diagnostico: dto.diagnostico,
          Reparacion: dto.reparacion,
          comentarios: dto.comentarios,
          imagen1: dto.imagen1,
          imagen2: dto.imagen2,
          // Tiempos e información de sistema:
          fechaResolucion: ahora,
          creadoPor: usuario,
          fechaCreacion: ahora,
          idEstado: 'reparado', // ¡Agregamos el estado que le corresponde al detalle!
        },
      });

      return ticketCerrado;
    });
  }
}