import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extraer el usuario autenticado del request.
 *
 * Uso:
 *   @GetUser() user         → objeto completo del usuario desde JWT
 *   @GetUser('userId') id   → solo el userId
 *   @GetUser('role') role   → solo el rol
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
