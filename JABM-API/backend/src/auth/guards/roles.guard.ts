import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de autorización por roles (RBAC).
 *
 * Seguridad:
 * - Verifica que el usuario autenticado tenga al menos uno de los roles
 *   requeridos por el decorator @Roles().
 * - Si no se especifican roles en el decorator, permite el acceso
 *   (el guard solo restringe cuando se aplica explícitamente).
 * - Debe usarse DESPUÉS de JwtAuthGuard para que request.user exista.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se requieren roles específicos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No se encontró información del usuario');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para esta acción',
      );
    }

    return true;
  }
}
