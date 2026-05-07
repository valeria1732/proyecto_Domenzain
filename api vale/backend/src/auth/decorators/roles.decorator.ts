import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator personalizado para establecer los roles requeridos en una ruta.
 * Uso: @Roles(Role.ADMIN) o @Roles(Role.ADMIN, Role.USER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
