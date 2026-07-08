import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET')!;
    console.log('✅ JwtStrategy inicializada con el secreto:', jwtSecret); // <--- Rastreador 1

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('✅ Token válido, payload decodificado:', payload); // <--- Rastreador 2
    
    return {
      idUsuario: payload.sub,
      useremail: payload.useremail,
      perfil: payload.perfil,
      idtecnico: payload.idtecnico,
    };
  }
}