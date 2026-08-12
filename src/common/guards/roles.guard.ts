import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const tienePermiso = requiredRoles.includes(user?.perfil);

    // 🚨 CHISMOSO ACTIVADO 🚨 (Bórralo cuando vayas a producción)
    if (!tienePermiso) {
      console.log('❌ ACCESO DENEGADO ❌');
      console.log(`Ruta intentada: ${request.method} ${request.url}`);
      console.log(`Roles permitidos aquí: ${requiredRoles}`);
      console.log(`Rol del usuario actual: ${user?.perfil}`);
    }

    return tienePermiso;
  }
}