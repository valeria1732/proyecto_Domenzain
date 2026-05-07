import { Exclude, Expose } from 'class-transformer';

/**
 * DTO de respuesta de usuario.
 *
 * Seguridad:
 * - @Exclude() en password garantiza que NUNCA se incluya en respuestas HTTP,
 *   incluso si el serializer global falla, este DTO actúa como segunda capa.
 */
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
