export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_cambiar_en_produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },

  database: {
    url: process.env.DATABASE_URL || '',
  },

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },
};
