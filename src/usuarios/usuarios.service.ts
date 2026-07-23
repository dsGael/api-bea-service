import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEmpleadoDto, ActualizarEmpleadoDto, CambiarPasswordDto,CambiarPerfilDto} from './dto/crear-actualizar-empleado.dto';
import { randomUUID } from 'node:crypto';


const PERFILES_TECNICO = ['tecnicojr', 'tecnicosinior'];

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
    const empleados = await this.prisma.cat_empleados.findMany({
      where: { cat_usuarios_app: { is: { perfil: { in: PERFILES_TECNICO } } } },
      include: { cat_usuarios_app: true },
      orderBy: { nombre: 'asc' },
    });
    return empleados.map((e) => ({
      ...e,
      cat_usuarios_app: limpiarCuenta(e.cat_usuarios_app?.[0]),
    }));
  }

  async obtenerPorId(idEmpleado: string) {
    const empleado = await this.prisma.cat_empleados.findUnique({
      where: { idEmpleado },
      include: { cat_usuarios_app: true },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return { ...empleado, cat_usuarios_app: limpiarCuenta(empleado.cat_usuarios_app?.[0]) };
  }

  async crear(dto: CrearEmpleadoDto, creadoPor: string) {
    const existente = await this.prisma.cat_usuarios_app.findFirst({
      where: { useremail: dto.useremail },
    });
    if (existente) {
      throw new ConflictException(`Ya existe una cuenta con el correo "${dto.useremail}"`);
    }

    const idEmpleado = randomUUID();
    const idUsuarioApp = randomUUID();
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
          idHorario: dto.idHorario,
          activo: true, 
          fechaIngreso: ahora,
          quienModifica: creadoPor,
          fechaModificacion: ahora,
        },
      }),
      this.prisma.cat_usuarios_app.create({
        data: {
          idUsuarioApp,
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

    return this.prisma.cat_empleados.update({
      where: { idEmpleado },
      data: {
        activo: false,  
        fechaBaja: new Date(),
        quienModifica: modificadoPor,
        fechaModificacion: new Date(),
      },
    });
  }

  async reactivar(idEmpleado: string, modificadoPor: string) {
    await this.obtenerPorId(idEmpleado);

    return this.prisma.cat_empleados.update({
      where: { idEmpleado },
      data: {
        activo: true,
        fechaBaja: null,
        quienModifica: modificadoPor,
        fechaModificacion: new Date(),
      },
    });
  }
}