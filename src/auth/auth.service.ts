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
    const usuario = await this.prisma.cat_usuario.findFirst({
      where: { idUsuario: dto.usuario },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.contrase_a !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.activo !== true) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: usuario.idUsuario,
      useremail: usuario.useremail,
      perfil: usuario.perfil,
      idtecnico: usuario.idtecnico,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.idUsuario,
        idtecnico: usuario.idtecnico, // <- agregado
        nombre: usuario.nombre,
        perfil: usuario.perfil,
      },
    };
  }
}