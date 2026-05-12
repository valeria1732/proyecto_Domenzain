import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ============================================================
  // SEGURIDAD HTTP — Helmet
  // ============================================================
  // Establece headers de seguridad HTTP estándar:
  // - X-Content-Type-Options: nosniff
  // - X-Frame-Options: SAMEORIGIN
  // - Strict-Transport-Security
  // - X-XSS-Protection
  // - Content-Security-Policy (básico)
  app.use(helmet());

  // ============================================================
  // CORS
  // ============================================================
  app.enableCors({
    origin: appConfig.allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ============================================================
  // PREFIJO GLOBAL DE RUTAS
  // ============================================================
  // Todas las rutas quedan bajo /api/v1/...
  app.setGlobalPrefix('api/v1');

  // ============================================================
  // VALIDACIÓN GLOBAL — ValidationPipe
  // ============================================================
  // whitelist: elimina campos no definidos en el DTO (previene mass assignment)
  // forbidNonWhitelisted: rechaza requests con campos no permitidos
  // transform: convierte los payloads a instancias DTO (type safety)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ============================================================
  // FILTRO GLOBAL DE EXCEPCIONES
  // ============================================================
  // Intercepta todas las excepciones y devuelve respuestas seguras:
  // - Los errores 500 NUNCA exponen stack traces ni mensajes internos
  // - Formato de respuesta consistente
  app.useGlobalFilters(new HttpExceptionFilter());

  // ============================================================
  // SERIALIZACIÓN GLOBAL
  // ============================================================
  // Aplica @Exclude() de class-transformer a todas las respuestas.
  // Garantiza que campos sensibles nunca aparezcan en respuestas.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ============================================================
  // SWAGGER — Documentación de la API
  // ============================================================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Vale')
    .setDescription(
      'API REST para gestión de tareas con autenticación JWT, RBAC y auditoría completa.\n\n' +
      '## Roles del Sistema\n\n' +
      '**ADMIN** — Gestión completa de usuarios (crear, editar, eliminar, cambiar rol). ' +
      'Sin acceso a tareas de otros usuarios.\n\n' +
      '**USER** — Consulta y gestión de sus propias tareas únicamente. ' +
      'No puede acceder a tareas de otros usuarios.\n\n' +
      '## Autenticación\n\n' +
      'Usa el botón **Authorize** e ingresa tu token JWT con el formato: `Bearer <tu_token>`\n\n' +
      '## Seguridad\n\n' +
      '- Contraseñas hasheadas con **Argon2id**\n' +
      '- JWT con expiración de **15 minutos**\n' +
      '- Protección anti-IDOR en todas las consultas de tareas\n' +
      '- Auditoría de todas las operaciones críticas',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT (sin el prefijo Bearer)',
        in: 'header',
      },
      'JWT-Auth',
    )
    .addTag('Autenticación', 'Login, logout y perfil — Acceso público o con JWT')
    .addTag('Usuarios (Admin)', 'CRUD de usuarios — Solo ADMIN')
    .addTag('Tareas', 'Consulta de tareas propias — Solo USER')
    .addTag('Auditoría (Admin)', 'Logs de seguridad — Solo ADMIN')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Vale — Documentación',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar-wrapper .link { display: none; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // ============================================================
  // INICIAR SERVIDOR
  // ============================================================
  await app.listen(appConfig.port);
  logger.log(`Servidor iniciado en:        http://localhost:${appConfig.port}`);
  logger.log(`Swagger UI disponible en:   http://localhost:${appConfig.port}/api/docs`);
  logger.log(`API base URL:               http://localhost:${appConfig.port}/api/v1`);
  logger.log(`Entorno:                    ${appConfig.nodeEnv}`);
}

bootstrap();
