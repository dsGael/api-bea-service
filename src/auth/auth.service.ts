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
      include: { cat_empleados: true },
    });
    console.log('Found account:', cuenta); // Log the found account for debugging

    if (!cuenta) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (cuenta.contrase_a !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // cat_empleados.activo es la fuente de verdad para decidir acceso —
    // cat_usuarios_app.activo queda como dato secundario, no se valida aquí.
    if (!(cuenta.cat_empleados?.activo)) {
      throw new UnauthorizedException('Usuario inactivo');
    }

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
        especialidad: cuenta.especialidad,
        idEmpresa: cuenta.cat_empleados?.idEmpresa,
      },
    };
  }
}