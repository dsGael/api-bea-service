import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';



@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const cuenta = await this.prisma.cat_usuarios_app.findFirst({
      where: {
        OR: [{ idEmpleado: dto.usuario }, { useremail: dto.usuario }],
      },
      include: {
        cat_empleados: true,
        geocercas: {
          select: { idGeocerca: true, coordenada: true, radio: true },
        },
      },
    });

    if (!cuenta) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (cuenta.contrase_a !== dto.password) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    // cat_usuarios_app.activo es la fuente de verdad para decidir acceso.
    // Validamos directamente el campo `activo` de la cuenta de usuario.
    if (!cuenta.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    console.log('Cuenta encontrada:', cuenta);

    const payload = {
      sub: cuenta.idUsuarioApp,
      idEmpleado: cuenta.idEmpleado,
      perfil: cuenta.perfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        idUsuarioApp: cuenta.idUsuarioApp,
        idEmpleado: cuenta.idEmpleado,
        nombre: cuenta.cat_empleados?.nombre,
        perfil: cuenta.perfil,
        useremail: cuenta.useremail,
        idEmpresa: cuenta.cat_empleados?.idEmpresa,
        idGeocerca: cuenta.idGeocerca ?? null,
        geocerca: cuenta.geocercas
          ? {
              idGeocerca: cuenta.geocercas.idGeocerca,
              coordenada: cuenta.geocercas.coordenada,
              radio: cuenta.geocercas.radio,
            }
          : null,
        
      },
    };
  }

    async obtenerPerfil(idUsuarioApp: string) {
    const cuenta = await this.prisma.cat_usuarios_app.findUnique({
      where: { idUsuarioApp },
      include: {
        cat_empleados: true,
        geocercas: {
          select: { idGeocerca: true, coordenada: true, radio: true },
        },
      },
    });

    if (!cuenta) {
      throw new UnauthorizedException('Cuenta no encontrada');
    }

    return {
      idUsuarioApp: cuenta.idUsuarioApp,
      idEmpleado: cuenta.idEmpleado,
      nombre: cuenta.cat_empleados?.nombre,
      perfil: cuenta.perfil,
      useremail: cuenta.useremail,
      idEmpresa: cuenta.cat_empleados?.idEmpresa,
      idGeocerca: cuenta.idGeocerca ?? null,
      geocerca: cuenta.geocercas
        ? {
            idGeocerca: cuenta.geocercas.idGeocerca,
            coordenada: cuenta.geocercas.coordenada,
            radio: cuenta.geocercas.radio,
          }
        : null,
    };
  }
}