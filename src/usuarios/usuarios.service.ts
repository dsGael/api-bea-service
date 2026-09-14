import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEmpleadoDto, ActualizarEmpleadoDto, CambiarPasswordDto,CambiarPerfilDto} from './dto/crear-actualizar-empleado.dto';
import { randomUUID } from 'node:crypto';


const PERFILES_TECNICO = ['tecnicojr', 'tecnicosinior', 'mesacontrol'];

function limpiarCuenta(cuenta: any) {
  if (!cuenta) return null;
  const { contrase_a, ...resto } = cuenta;
  return resto;
}

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const empleados = await this.prisma.cat_empleados.findMany({
      include: { cat_usuarios_app: true },
      orderBy: { nombre: 'asc' },
    });
    return empleados.map((e) => ({
      ...e,
      cat_usuarios_app: limpiarCuenta(e.cat_usuarios_app?.[0]),
    }));
  }

async listarTecnicos() {
  const cuentas = await this.prisma.cat_usuarios_app.findMany({
    where: { perfil: { in: PERFILES_TECNICO }, activo: true },
    include: { cat_empleados: true },
    orderBy: { cat_empleados: { nombre: 'asc' } },
  });

  return cuentas.map((c) => {
    const { contrase_a, cat_empleados, ...resto } = c;
    return { ...resto, cat_empleados };
  });
}

  async obtenerPorId(idUsuarioApp: string) {
    const usuario = await this.prisma.cat_usuarios_app.findUnique({
      where: { idUsuarioApp },
      include: { cat_empleados: true },
    });
    if (!usuario) throw new NotFoundException('Empleado no encontrado');
    return { ...usuario, cat_empleado: limpiarCuenta(usuario.cat_empleados?.[0]) };
  }

  async crear(dto: CrearEmpleadoDto, creadoPor: string) {
    const existente = await this.prisma.cat_usuarios_app.findFirst({
      where: { useremail: dto.useremail },
    });
    if (existente) {
      throw new ConflictException(`Ya existe una cuenta con el correo "${dto.useremail}"`);
    }

    const idEmpleado = randomUUID();
    
    // randomUUID();
    const ahora = new Date();
    

    const [empleado, cuenta] = await this.prisma.$transaction([
      this.prisma.cat_empleados.create({
        data: {
          idEmpleado,
          nombre: dto.nombre,
          celular: dto.celular,
          numEmpleado: dto.numEmpleado,
          idEmpresa: dto.idEmpresa,
          departamento: dto.departamento,
          puesto: dto.puesto,
          //idHorario: dto.idHorario,
          activo: true, 
          fechaIngreso: ahora,
          quienModifica: creadoPor,
          fechaModificacion: ahora,
        },
      }),
      this.prisma.cat_usuarios_app.create({
        data: {
          idUsuarioApp:dto.idUsuarioApp,
          idEmpleado,
          useremail: dto.useremail,
          contrase_a: dto.password,
          perfil: dto.perfil,
          especialidad: dto.especialidad,
          activo: true, 
          creadoPor,
          fechaCreacion: ahora.toISOString(), // columna es String, no DateTime
        },
      }),
    ]);

    return { ...empleado, cat_usuarios_app: limpiarCuenta(cuenta) };
  }

  async actualizar(idEmpleado: string, dto: ActualizarEmpleadoDto, modificadoPor: string) {
    await this.obtenerPorId(idEmpleado);

    const empleado = await this.prisma.cat_empleados.update({
      where: { idEmpleado },
      data: { ...dto, quienModifica: modificadoPor, fechaModificacion: new Date() },
      include: { cat_usuarios_app: true },
    });

    return { ...empleado, cat_usuarios_app: limpiarCuenta(empleado.cat_usuarios_app?.[0]) };
  }

  async cambiarPassword(idUsuarioApp: string, dto: CambiarPasswordDto) {
    const cuenta = await this.prisma.cat_usuarios_app.findUnique({ where: { idUsuarioApp } });
    if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

    await this.prisma.cat_usuarios_app.update({
      where: { idUsuarioApp },
      data: { contrase_a: dto.passwordNuevo },
    });

    return { actualizado: true };
  }

  // Ya no hay que sincronizar dos tablas: perfil vive solo en cat_usuarios_app ahora
  async cambiarPerfil(idUsuarioApp: string, dto: CambiarPerfilDto) {
    const cuenta = await this.prisma.cat_usuarios_app.findUnique({ where: { idUsuarioApp } });
    if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

    const actualizada = await this.prisma.cat_usuarios_app.update({
      where: { idUsuarioApp },
      data: { perfil: dto.perfil },
    });

    return limpiarCuenta(actualizada);
  }

  async desactivar(idEmpleado: string, modificadoPor: string) {
    await this.obtenerPorId(idEmpleado);
    const ahora = new Date();

    const [empleado] = await this.prisma.$transaction([
      this.prisma.cat_empleados.update({
        where: { idEmpleado },
        data: {
          activo: false,
          fechaBaja: ahora,
          quienModifica: modificadoPor,
          fechaModificacion: ahora,
        },
      }),
      this.prisma.cat_usuarios_app.updateMany({
        where: { idEmpleado },
        data: { activo: false, fechaModificacion: ahora.toISOString() },
      }),
    ]);

    return empleado;
  }

  async reactivar(idEmpleado: string, modificadoPor: string) {
    await this.obtenerPorId(idEmpleado);
    const ahora = new Date();

    const [empleado] = await this.prisma.$transaction([
      this.prisma.cat_empleados.update({
        where: { idEmpleado },
        data: {
          activo: true,
          fechaBaja: null,
          quienModifica: modificadoPor,
          fechaModificacion: ahora,
        },
      }),
      this.prisma.cat_usuarios_app.updateMany({
        where: { idEmpleado },
        data: { activo: true, fechaModificacion: ahora.toISOString() },
      }),
    ]);

    return empleado;
  }

  async subirFotoPerfil(idEmpleado: string, urlFoto: string) {
    const empleado = await this.obtenerPorId(idEmpleado);
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const actualizado = await this.prisma.cat_empleados.update({
      where: { idEmpleado },
      data: { foto: urlFoto, fechaModificacion: new Date() },
    });

    return actualizado;

  }

}