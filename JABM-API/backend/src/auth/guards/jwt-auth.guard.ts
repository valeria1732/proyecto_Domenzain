import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación JWT.
 * Extiende AuthGuard de Passport para verificar que el request
 * contiene un JWT válido.
 *
 * Uso: @UseGuards(JwtAuthGuard) en controladores o rutas específicas.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
