import { registerAs } from '@nestjs/config';

/**
 * Configuración de la base de datos.
 * Todos los valores se toman de variables de entorno.
 * NUNCA se hardcodean credenciales en el código fuente.
 */
export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'api_jabm',
}));
