import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogosService } from '../catalogos/catalogos.service';
import { CrearTicketDto,CrearFolioMantenimientoDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto,ValidarTicketDto } from './dto/cerrar-ticket.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { ListarTicketsQueryDto } from './dto/listar-tickets.dto';
import { Prisma } from '@prisma/client';

// idestado — ids reales de tu catálogo cat_estado_r, única fuente de verdad del estado
const ESTADO_ABIERTO_ID = 'ABI9e9uqgr';
const ESTADO_VALIDACION_ID = 'VALID123';
const ESTADO_FINALIZADO_ID = 'FIN5c61e7';
const ESTADO_CANCELADO_ID = 'CANb911e';
const ESTADO_PENDIENTE_ID = 'pdterefac';

// Confirmado en tu trigger fn_generar_folio_ticket: este es el id real que
// distingue mantenimiento preventivo (dispara el folio con prefijo "MTTO")
const TIPO_MANTENIMIENTO_ID = 'pr3v3nt1v0';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogos: CatalogosService,
  ) {}

  async listarTodos(query: ListarTicketsQueryDto) {
    const { page = 1, limit = 20, ...filtros } = query;

    const where = {
      ...(filtros.idestado && { idestado: filtros.idestado }),
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
          estado: true,
          cat_tecnicos: true,
          cat_dispositivo_t: true,
        },
        orderBy: { fechacreacion: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bin_ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Resolvers: cada uno reemplaza una fórmula que antes vivía en AppSheet ──

  private async resolverIdEmpresa(
    idempresa?: string,
    idreporta?: string,
    idUsuarioApp?: string,
  ): Promise<string> {
    if (idempresa) return idempresa;

    if (idreporta) {
      const reporta = await this.prisma.cat_reporta.findUnique({
        where: { idReporta: idreporta },
        select: { idEmpresa: true },
      });
      if (reporta?.idEmpresa) return reporta.idEmpresa;
    }

    if (idUsuarioApp) {
      const cuenta = await this.prisma.cat_usuarios_app.findUnique({
        where: { idUsuarioApp },
        select: { cat_empleados: { select: { idEmpresa: true } } },
      });
      if (cuenta?.cat_empleados?.idEmpresa) return cuenta.cat_empleados.idEmpresa;
    }

    throw new BadRequestException('El idempresa es obligatorio.');
  }

  /**
   * Igual que antes: busca la ruta asignada hoy a la unidad, vía asignacion_diaria.
   */
  private async resolverIdRuta(idruta?: string, numeroEconomico?: string): Promise<string | undefined> {
    if (idruta) return idruta;
    if (!numeroEconomico) return undefined;

    const { inicioDia, finDia } = this.rangoHoy();

    const asignacion = await this.prisma.asignacion_diaria.findFirst({
      where: { UNIDAD: numeroEconomico, FECHA: { gte: inicioDia, lte: finDia } },
    });
    if (!asignacion) return undefined;

    const ruta = await this.prisma.cat_ruta.findFirst({
      where: { nombre: asignacion.LINEA?.toString() },
      select: { idRuta: true },
    });

    return ruta?.idRuta;
  }

  /**
   * Nuevo: resuelve numeroEconomico directo de cat_autobus.
   * Antes esto se repetía dentro de resolverIdRuta sin guardarse en el ticket;
   * ahora lo separamos porque bin_ticket.numeroeconomico también necesita llenarse.
   */
  private async resolverNumeroEconomico(idautobus?: string): Promise<string | undefined> {
    if (!idautobus) return undefined;
    const autobus = await this.prisma.cat_autobus.findUnique({
      where: { idAutobus: idautobus },
      select: { numeroEconomico: true },
    });
    return autobus?.numeroEconomico ?? undefined;
  }

  /**
   * Nuevo: replica la fórmula de AppSheet
   * any(SELECT(asignacionDiaria[OPERADOR], AND([UNIDAD]=numeroEconomico, [FECHA]=TODAY())))
   *
   * OPERADOR en tu tabla es texto libre, sin llave foránea real a `conductores` todavía —
   * por eso idoperador y nombreoperador terminan siendo el mismo valor. Si me confirmas
   * la columna que conecta con `conductores`, esto se puede separar correctamente.
   */
  private async resolverOperador(
    numeroEconomico?: string,
  ): Promise<{ idoperador?: string; nombreoperador?: string }> {
    if (!numeroEconomico) return {};

    const { inicioDia, finDia } = this.rangoHoy();

    const asignacion = await this.prisma.asignacion_diaria.findFirst({
      where: { UNIDAD: numeroEconomico, FECHA: { gte: inicioDia, lte: finDia } },
      select: { OPERADOR: true },
    });

    return {
      idoperador: asignacion?.OPERADOR ?? undefined,
      nombreoperador: asignacion?.OPERADOR ?? undefined,
    };
  }

  /**
   * Nuevo: reemplaza el subquery manual de AppSheet
   * any(select(catDispositivo[idDispositivoT], [idDispositivo]=[_THISROW].[idDispositivo]))
   * Ahora que tu schema tiene la relación real cat_dispositivo -> cat_dispositivo_t,
   * esto es una consulta normal y tipada, no un SELECT crudo.
   */
  private async resolverIdDispositivoT(iddispositivo?: string): Promise<string | undefined> {
    if (!iddispositivo) return undefined;
    const dispositivo = await this.prisma.cat_dispositivo.findUnique({
      where: { idDispositivo: iddispositivo },
      select: { idDispositivoT: true },
    });
    return dispositivo?.idDispositivoT ?? undefined;
  }

  private rangoHoy() {
    const ahora = new Date();
    return {
      inicioDia: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()),
      finDia: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59),
    };
  }

  /**
   * Genera un folio real y único usando una secuencia de Postgres — reemplaza el
   * `folio: ''` que rompía en el segundo insert por violar el unique constraint.
   * Requiere correr una vez en tu base:
   *   CREATE SEQUENCE IF NOT EXISTS bin_ticket_num_folio_seq;
   */
  /**
   * Inserción compartida entre folio normal y folio de mantenimiento.
   * Aquí se resuelven TODOS los campos derivados server-side — el cliente
   * (app/web) ya no necesita mandarlos ni duplicar esta lógica de negocio.
   */
  private async crearTicketBase(
    campos: {
      idautobus?: string;
      idruta?: string;
      iddispositivo?: string;
      idfalla?: string;
      idcategoria?: string;
      idprioridad?: string;
      idreporta?: string;
      comentarios?: string;
      idempresa: string;
      idtecnico?: string;
      tiporeparacion?: string;
    },
    usuario: string,
  ) {
    const ahora = new Date();
    const soloFecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    const numeroeconomico = await this.resolverNumeroEconomico(campos.idautobus);
    const idRutaFinal = await this.resolverIdRuta(campos.idruta, numeroeconomico);
    const { idoperador, nombreoperador } = await this.resolverOperador(numeroeconomico);
    const iddispositivot = await this.resolverIdDispositivoT(campos.iddispositivo);

    try {
      return await this.prisma.bin_ticket.create({
        data: {
          idticket: randomUUID(),
          // folio y num_folio quedan vacíos a propósito: el trigger
          // fn_generar_folio_ticket() de tu base los resuelve en el INSERT,
          // con la lógica real de prefijos por empresa/tipo de reparación.
          folio: '',
          fecha: soloFecha,
          fechahora: ahora,
          idautobus: campos.idautobus,
          numeroeconomico,
          idruta: idRutaFinal,
          idoperador,
          nombreoperador,
          iddispositivo: campos.iddispositivo,
          iddispositivot,
          idfalla: campos.idfalla,
          idcategoria: campos.idcategoria,
          idprioridad: campos.idprioridad,
          idreporta: campos.idreporta,
          idtecnico: campos.idtecnico,
          tiporeparacion: campos.tiporeparacion,
          comentarios: campos.comentarios,
          idestado: ESTADO_ABIERTO_ID,
          idempresa: campos.idempresa,
          creadopor: usuario,
          fechacreacion: ahora,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          `Error de integridad: El identificador proporcionado no existe en el catálogo relacionado. (Referencia: ${error.meta?.field_name})`,
        );
      }
      throw error;
    }
  }

  async crearTicket(dto: CrearTicketDto, usuario: string) {
    const idEmpresaFinal = await this.resolverIdEmpresa(dto.idempresa, dto.idreporta);

    return this.crearTicketBase(
      {
        idautobus: dto.idautobus,
        iddispositivo: dto.iddispositivo,
        idfalla: dto.idfalla,
        idcategoria: dto.idcategoria,
        idprioridad: dto.idprioridad,
        idreporta: dto.idreporta,
        comentarios: dto.comentarios,
        idempresa: idEmpresaFinal,
      },
      usuario,
    );
  }

  async crearFolioMantenimiento(
    dto: CrearFolioMantenimientoDto,
    idUsuarioApp: string,
    usuario: string,
  ) {
    const idEmpresaFinal = await this.resolverIdEmpresa(undefined, undefined, idUsuarioApp);

    return this.crearTicketBase(
      {
        idautobus: dto.idautobus,
        iddispositivo: dto.iddispositivo,
        idcategoria: dto.idcategoria,
        comentarios: dto.comentarios,
        idempresa: idEmpresaFinal,
        idtecnico: idUsuarioApp, // bin_ticket.idtecnico -> cat_usuarios_app.idUsuarioApp
        tiporeparacion: TIPO_MANTENIMIENTO_ID,
      },
      usuario,
    );
  }

  async listarPorTecnico(idtecnico: string) {
    return this.prisma.bin_ticket.findMany({
      where: {
        idtecnico,
        idestado: { notIn: [ESTADO_FINALIZADO_ID, ESTADO_CANCELADO_ID] },
      },
      include: {
        cat_falla: true,
        cat_autobus: true,
        cat_prioridad: true,
        estado: true,
        cat_dispositivo_t: true,
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
        estado: true,
        cat_tecnicos: true,
        cat_dispositivo_t: true,
        solicitud_refaccion: true,
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
        modificadopor: usuario,
        fechamodificacion: new Date(),
      },
    });
  }

  /**
   * El técnico registra su reparación: crea el detalle Y somete el folio a
   * validación de mesa de control (Abierto -> Validación MC).
   */
  async registrarReparacion(idticket: string, dto: CerrarTicketDto, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.idestado === ESTADO_FINALIZADO_ID) {
      throw new BadRequestException('El ticket ya está finalizado');
    }
    if (ticket.idestado === ESTADO_VALIDACION_ID) {
      throw new BadRequestException('El ticket ya está en validación de mesa de control');
    }

    const ahora = new Date();

    return this.prisma.$transaction(async (tx) => {
      const ticketActualizado = await tx.bin_ticket.update({
        where: { idticket },
        data: {
          idestado: ESTADO_VALIDACION_ID,
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
          numeroeconomico: ticket.numeroeconomico, // reutilizado, no se vuelve a resolver
          idRuta: ticket.idruta,
          idDispositivo: ticket.iddispositivo,
          idDispositivoT: ticket.iddispositivot, // reutilizado del ticket ya resuelto
          idFalla: ticket.idfalla,
          idCategoria: ticket.idcategoria,
          idPrioridad: ticket.idprioridad,
          idTecnico: ticket.idtecnico,
          Diagnostico: dto.diagnostico,
          Reparacion: dto.reparacion,
          comentarios: dto.comentarios,
          imagen1: dto.imagen1,
          imagen2: dto.imagen2,
          fechaResolucion: ahora,
          creadoPor: usuario,
          fechaCreacion: ahora,
          idEstado: ESTADO_VALIDACION_ID,
        },
      });

      return ticketActualizado;
    });
  }

  /**
   * Mesa de control valida: aprueba -> Finalizado. Rechaza -> regresa a Abierto.
   */
  async validarTicket(idticket: string, dto: ValidarTicketDto, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.idestado !== ESTADO_VALIDACION_ID) {
      throw new BadRequestException('El ticket no está en validación de mesa de control');
    }

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: {
        idestado: dto.aprobado ? ESTADO_FINALIZADO_ID : ESTADO_ABIERTO_ID,
        fecharesolucion: dto.aprobado ? new Date() : null,
        modificadopor: usuario,
        fechamodificacion: new Date(),
        comentarios: dto.comentarioRechazo
          ? `${ticket.comentarios ?? ''}\n[Rechazo MC]: ${dto.comentarioRechazo}`
          : ticket.comentarios,
      },
    });
  }

  async marcarPendiente(idticket: string, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if ([ESTADO_FINALIZADO_ID, ESTADO_CANCELADO_ID].includes(ticket.idestado ?? '')) {
      throw new BadRequestException('No se puede marcar como pendiente un ticket finalizado o cancelado');
    }

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: { idestado: ESTADO_PENDIENTE_ID, modificadopor: usuario, fechamodificacion: new Date() },
    });
  }

  async reanudarTicket(idticket: string, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.idestado !== ESTADO_PENDIENTE_ID) {
      throw new BadRequestException('El ticket no está en estado Pendiente');
    }

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: { idestado: ESTADO_ABIERTO_ID, modificadopor: usuario, fechamodificacion: new Date() },
    });
  }

  async cancelarTicket(idticket: string, usuario: string) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.idestado === ESTADO_FINALIZADO_ID) {
      throw new BadRequestException('No se puede cancelar un ticket ya finalizado');
    }

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: { idestado: ESTADO_CANCELADO_ID, modificadopor: usuario, fechamodificacion: new Date() },
    });
  }
}