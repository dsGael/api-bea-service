import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogosService } from '../catalogos/catalogos.service';
import { CrearTicketDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto } from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';

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



  async crearTicket(dto: CrearTicketDto, usuario: string) {
    // Validamos contra el catálogo antes de insertar — evita tickets con referencias huérfanas
    const fallas = await this.catalogos.listarFallas();
    const fallaValida = fallas.some((f) => f.id === dto.idfalla);
    if (!fallaValida) {
      throw new BadRequestException('idfalla no reconocido en el catálogo');
    }

    const ticket = await this.prisma.bin_ticket.create({
      data: {
        idticket: randomUUID(),
        folio: `T-${Date.now()}`,
        fecha: new Date(),
        fechahora: new Date(),
        idautobus: dto.idautobus,
        idruta: dto.idruta,
        idoperador: dto.idoperador,
        iddispositivo: dto.iddispositivo,
        idfalla: dto.idfalla,
        idcategoria: dto.idcategoria,
        idprioridad: dto.idprioridad,
        idreporta: dto.idreporta,
        comentarios: dto.comentarios,
        estatusrep: 'abierto',
        creadopor: usuario,
        fechacreacion: new Date(),
      },
    });

    return ticket;
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
    if (ticket.estatusrep === 'cerrado') {
      throw new BadRequestException('El ticket ya está cerrado');
    }

    // Transacción: el ticket se cierra Y se crea el registro de detalle,
    // o ninguna de las dos cosas pasa
    return this.prisma.$transaction(async (tx) => {
      const ticketCerrado = await tx.bin_ticket.update({
        where: { idticket },
        data: {
          estatusrep: 'cerrado',
          fecharesolucion: new Date(),
          modificadopor: usuario,
          fechamodificacion: new Date(),
        },
      });

      await tx.bin_ticket_detail.create({
        data: {
          idDetalle: randomUUID(),
          idTicket: idticket,
          fechaHora: new Date(),
          folio: ticket.folio,
          idAutobus: ticket.idautobus,
          idRuta: ticket.idruta,
          idDispositivo: ticket.iddispositivo,
          idFalla: ticket.idfalla,
          idCategoria: ticket.idcategoria,
          idTecnico: ticket.idtecnico,
          Diagnostico: dto.diagnostico,
          Reparacion: dto.reparacion,
          comentarios: dto.comentarios,
          imagen1: dto.imagen1,
          imagen2: dto.imagen2,
          fechaResolucion: new Date(),
          creadoPor: usuario,
          fechaCreacion: new Date(),
        },
      });

      return ticketCerrado;
    });
  }
}