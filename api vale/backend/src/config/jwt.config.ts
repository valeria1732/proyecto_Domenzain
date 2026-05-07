import { registerAs } from '@nestjs/config';

/**
 * Configuración de JWT.
 * El secret NUNCA debe estar hardcodeado; se toma de JWT_SECRET en .env.
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'cambia_esto_por_un_secreto_seguro',
  expiresIn: process.env.JWT_EXPIRES_IN || '60m',
}));
