import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../storage/minio.service';
import { CrearTicketDto, CrearFolioMantenimientoDto, EditarTicketDto } from './dto/crear-actualizar-ticket.dto';
import { CerrarTicketDto, ValidarTicketDto } from './dto/cerrar-ticket.dto';
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

// Roles que solo pueden ver/tocar SUS PROPIOS tickets, sin importar qué manden en el query
const ROLES_TECNICO = new Set(['tecnicojr', 'tecnicosinior']);

export interface UsuarioActual {
  idUsuarioApp: string;
  rol: string;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  private readonly TICKET_INCLUDES = {
    cat_falla: true,
    cat_autobus: true,
    cat_prioridad: true,
    estado: true,
    cat_tecnicos: true,
    cat_dispositivo_t: true,
    cat_dispositivo: true,
    cat_ruta: true,
    cat_empresa: true,
    //solicitud_refaccion: {include: { cat_tecnicos: true, cat_dispositivo_t: true }},
    bin_ticket_detail: {include: { cat_falla: true, cat_diagnostico:true,cat_autobus:true,cat_categoria:true,cat_estado_r:true ,cat_dispositivo: true, cat_dispositivo_t: true, cat_prioridad: true, solicitud_refaccion: {include: { cat_tecnicos: true, cat_dispositivo_t: true }}}},
  };

  // ─────────────────────────────────────────────────────────────────────
  // LISTADO ÚNICO PARAMETRIZADO
  // Reemplaza: /tecnico/:id, /mantenimiento, /mantenimiento/abierto,
  // /mantenimiento/tecnico/:id, /mantenimiento/abierto/tecnico/:id,
  // /correctivos/abierto
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Único punto de entrada para listados. Construye el `where` dinámicamente
   * a partir de filtros literales + flags de negocio (isMantenimiento, isAbierto, isActivo).
   *
   * `usuario` se usa para forzar idtecnico si el rol es técnico — el query nunca
   * puede sobreescribir esto, por eso se aplica AL FINAL.
   */
async listarTodos(query: ListarTicketsQueryDto, usuario: UsuarioActual) {
    // 👇 1. Agregamos 'buscar' a la desestructuración
    const { page = 1, limit = 20, isMantenimiento, isAbierto, isActivo, buscar, ...filtros } = query;

    const where: Prisma.bin_ticketWhereInput = {
      ...(filtros.idestado && { idestado: filtros.idestado }),
      ...(filtros.idautobus && { idautobus: filtros.idautobus }),
      ...(filtros.idruta && { idruta: filtros.idruta }),
      ...(filtros.idtecnico && { idtecnico: filtros.idtecnico }),
      ...(filtros.idprioridad && { idprioridad: filtros.idprioridad }),
      ...(filtros.idcategoria && { idcategoria: filtros.idcategoria }),
      ...(filtros.iddispositivoT && { iddispositivot: filtros.iddispositivoT }),
      ...(filtros.iddispositivo && { iddispositivo: filtros.iddispositivo }),
      ...(filtros.idfalla && { idfalla: filtros.idfalla }),
      ...(filtros.asunto_correo && { asunto_correo: { contains: filtros.asunto_correo, mode: 'insensitive' } }),
      ...(filtros.favoritos && { favoritos: filtros.favoritos }),
    };

    // Flags de negocio (reemplazan a los endpoints dedicados)
    if (isMantenimiento === 'true') {
      where.tiporeparacion = TIPO_MANTENIMIENTO_ID;
    } else if (isMantenimiento === 'false') {
      where.tiporeparacion = { not: TIPO_MANTENIMIENTO_ID };
    }

    if (isAbierto === 'true') {
      where.idestado = ESTADO_ABIERTO_ID; // pisa idestado si venía en filtros; es intencional
    }

    if (isActivo === 'true') {
      where.idestado = { notIn: [ESTADO_FINALIZADO_ID, ESTADO_CANCELADO_ID] };
    }

    // 👇 2. AQUÍ AGREGAMOS LA LÓGICA DE BÚSQUEDA
    if (buscar) {
      where.OR = [
        { folio: { contains: buscar, mode: 'insensitive' } },
        { comentarios: { contains: buscar, mode: 'insensitive' } },
        { numeroeconomico: { contains: buscar, mode: 'insensitive' } },
        // Opcional: Si quieres buscar por nombre de operador, lo agregas aquí
        // { nombreoperador: { contains: buscar, mode: 'insensitive' } }, 
      ];
    }

    // // ── Seguridad: un técnico NUNCA puede ver tickets de otro técnico ──
    // if (ROLES_TECNICO.has(usuario.rol)) {
    //   where.idtecnico = usuario.idUsuarioApp;
    // }

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.bin_ticket.findMany({
        where,
        include: this.TICKET_INCLUDES,
        orderBy: { fechacreacion: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.bin_ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────
  // RESOLVERS — cada uno reemplaza una fórmula que antes vivía en AppSheet
  // ─────────────────────────────────────────────────────────────────────

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

  private async resolverNumeroEconomico(idautobus?: string): Promise<string | undefined> {
    if (!idautobus) return undefined;
    const autobus = await this.prisma.cat_autobus.findUnique({
      where: { idAutobus: idautobus },
      select: { numeroEconomico: true },
    });
    return autobus?.numeroEconomico ?? undefined;
  }

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

  // ─────────────────────────────────────────────────────────────────────
  // MANEJO DE ARCHIVOS (MinIO)
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Sube un lote de archivos a MinIO bajo una carpeta consistente y
   * devuelve el arreglo de URLs resultante. Reutilizable para falla y reparación.
   */
  private async subirArchivos(
    files: Array<Express.Multer.File> | undefined,
    carpeta: string, // ej: `Fallas/${unidad}/${idticket}` o `Reparaciones/${unidad}/${idticket}`
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const promesas = files.map((file) => {
      const key = `${carpeta}/${Date.now()}-${file.originalname}`;
      return this.minioService.uploadFile('app-media', key, file.buffer, file.mimetype);
    });

    return Promise.all(promesas);
  }

  // ─────────────────────────────────────────────────────────────────────
  // CREACIÓN
  // ─────────────────────────────────────────────────────────────────────

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
          imagenfalla1: [], // String[] — se llena después de subir archivos, si los hay
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

  /**
   * Crea el ticket normal y, si vienen archivos, los sube a MinIO y guarda
   * las URLs en `imagenfalla1`. La subida ocurre DESPUÉS de crear el ticket
   * porque necesita el idticket para armar la ruta del bucket.
   */
  async crearTicket(dto: CrearTicketDto, usuario: string, files?: Array<Express.Multer.File>) {
    const idEmpresaFinal = await this.resolverIdEmpresa(dto.idempresa, dto.idreporta);

    const ticket = await this.crearTicketBase(
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

    if (files && files.length > 0) {
      const numeroeconomico = ticket.numeroeconomico ?? 'sin-unidad';
      const urls = await this.subirArchivos(files, `Fallas/${numeroeconomico}/${ticket.idticket}`);
      return this.prisma.bin_ticket.update({
        where: { idticket: ticket.idticket },
        data: { imagenfalla1: urls },
      });
    }

    return ticket;
  }

  /**
   * Crea el folio de mantenimiento preventivo (auto-asignado al técnico que lo crea).
   * Igual que crearTicket, sube evidencia de falla si viene.
   */
  async crearFolioMantenimiento(
    dto: CrearFolioMantenimientoDto,
    idUsuarioApp: string,
    usuario: string,
    files?: Array<Express.Multer.File>,
  ) {
    const idEmpresaFinal = await this.resolverIdEmpresa(undefined, undefined, idUsuarioApp);

    const ticket = await this.crearTicketBase(
      {
        idautobus: dto.idautobus,
        iddispositivo: dto.iddispositivo,
        idcategoria: dto.idcategoria,
        comentarios: dto.comentarios,
        idempresa: idEmpresaFinal,
        idtecnico: idUsuarioApp,
        tiporeparacion: TIPO_MANTENIMIENTO_ID,
      },
      usuario,
    );

    if (files && files.length > 0) {
      const numeroeconomico = ticket.numeroeconomico ?? 'sin-unidad';
      const urls = await this.subirArchivos(files, `Fallas/${numeroeconomico}/${ticket.idticket}`);
      return this.prisma.bin_ticket.update({
        where: { idticket: ticket.idticket },
        data: { imagenfalla1: urls },
      });
    }

    return ticket;
  }

  /**
   * Permite editar un ticket abierto: actualiza campos y/o agrega más
   * evidencias de falla (append al arreglo existente, nunca lo reemplaza).
   */
  async editarTicket(
    idticket: string,
    dto: EditarTicketDto,
    usuario: string,
    files?: Array<Express.Multer.File>,
  ) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if ([ESTADO_FINALIZADO_ID, ESTADO_CANCELADO_ID].includes(ticket.idestado ?? '')) {
      throw new BadRequestException('No se puede editar un ticket finalizado o cancelado');
    }

    let nuevasUrls: string[] = [];
    if (files && files.length > 0) {
      const numeroeconomico = ticket.numeroeconomico ?? 'sin-unidad';
      nuevasUrls = await this.subirArchivos(files, `Fallas/${numeroeconomico}/${idticket}`);
    }

    return this.prisma.bin_ticket.update({
      where: { idticket },
      data: {
        ...(dto.idfalla && { idfalla: dto.idfalla }),
        ...(dto.idcategoria && { idcategoria: dto.idcategoria }),
        ...(dto.idprioridad && { idprioridad: dto.idprioridad }),
        ...(dto.comentarios && { comentarios: dto.comentarios }),
        ...(nuevasUrls.length > 0 && {
          imagenfalla1: { push: nuevasUrls }, // append, no reemplaza
        }),
        modificadopor: usuario,
        fechamodificacion: new Date(),
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // DETALLE
  // ─────────────────────────────────────────────────────────────────────

  async obtenerPorId(idticket: string, usuario: UsuarioActual) {
    const ticket = await this.prisma.bin_ticket.findUnique({
      where: { idticket },
      include: this.TICKET_INCLUDES
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    // Un técnico no puede ver el detalle de un folio que no es suyo
    if (ROLES_TECNICO.has(usuario.rol) && ticket.idtecnico !== usuario.idUsuarioApp) {
      throw new ForbiddenException('No tienes acceso a este folio');
    }

    return ticket;
  }

  // ─────────────────────────────────────────────────────────────────────
  // TRANSICIONES DE ESTADO
  // ─────────────────────────────────────────────────────────────────────

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
   * El técnico registra su reparación: sube evidencia de reparación (String[]),
   * crea el detalle, y somete el folio a validación de mesa de control
   * (Abierto -> Validación MC).
   *
   * La subida a MinIO ocurre ANTES de abrir la transacción de Prisma:
   * si la subida falla, no queremos una transacción de BD abierta esperando
   * I/O de red. Solo si la subida tiene éxito se procede a la transacción.
   */
  async registrarReparacion(
    idticket: string,
    dto: CerrarTicketDto,
    usuario: string,
    files?: Array<Express.Multer.File>,
  ) {
    const ticket = await this.prisma.bin_ticket.findUnique({ where: { idticket } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.idestado === ESTADO_FINALIZADO_ID) {
      throw new BadRequestException('El ticket ya está finalizado');
    }
    if (ticket.idestado === ESTADO_VALIDACION_ID) {
      throw new BadRequestException('El ticket ya está en validación de mesa de control');
    }

    const numeroeconomico = ticket.numeroeconomico ?? 'sin-unidad';
    const evidencias = await this.subirArchivos(files, `Reparaciones/${numeroeconomico}/${idticket}`);

    const ahora = new Date()

    return this.prisma.$transaction(async (tx) => {
      const ticketActualizado = await tx.bin_ticket.update({
        where: { idticket },
        data: {
          idestado: ESTADO_VALIDACION_ID,
          modificadopor: usuario,
          fechamodificacion: ahora,
        },
      });

      const idDetalle = dto.idDetalle || randomUUID();

        const fechaHoraUtc = new Date(dto.fechaHora || ahora); 
      // hora y fecha: la hora de PARED en Sonora — Sonora es fija UTC-7, sin horario de verano
      const OFFSET_SONORA_MS = 7 * 60 * 60 * 1000;
      const fechaHoraSonora = new Date(fechaHoraUtc.getTime() - OFFSET_SONORA_MS);

      await tx.bin_ticket_detail.create({
        data: {
          idDetalle,
          idTicket: idticket,
          fechaHora: fechaHoraSonora ,
          folio: ticket.folio,
          idAutobus: ticket.idautobus,
          numeroeconomico: ticket.numeroeconomico,
          idRuta: ticket.idruta,
          idDispositivo: ticket.iddispositivo,
          idDispositivoT: ticket.iddispositivot,
          idFalla: ticket.idfalla,
          idCategoria: ticket.idcategoria,
          idPrioridad: ticket.idprioridad,
          idTecnico: ticket.idtecnico,
          Diagnostico: dto.diagnostico,
          Reparacion: dto.reparacion,
          comentarios: dto.comentarios,
          imagen1:evidencias, // String[] — pruebas de reparación subidas por el técnico
          fechaResolucion: fechaHoraSonora,
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