import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones HTTP.
 *
 * Seguridad:
 * - Los errores 500 NUNCA exponen stack traces ni mensajes internos de BD
 *   al cliente. Esto previene la fuga de información de infraestructura
 *   que un atacante podría usar para diseñar ataques más dirigidos.
 * - Los errores conocidos (HttpException) sí devuelven su mensaje.
 * - Todos los errores se registran internamente con Logger para debugging.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Preservar mensajes de validación de class-validator
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse;
    } else {
      // Error inesperado: NUNCA revelar detalles internos al cliente
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ha ocurrido un error interno en el servidor';

      // Registrar el error real en logs del servidor para debugging
      this.logger.error(
        `Error no controlado: ${exception instanceof Error ? exception.message : 'Unknown'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}
