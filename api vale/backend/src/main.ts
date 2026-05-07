import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ========================================
  // SEGURIDAD GLOBAL — ValidationPipe
  // ========================================
  // whitelist: elimina propiedades no definidas en el DTO (previene mass assignment)
  // forbidNonWhitelisted: rechaza requests con propiedades extra (detección de ataques)
  // transform: convierte payloads a las instancias DTO para type safety
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ========================================
  // SEGURIDAD GLOBAL — HttpExceptionFilter
  // ========================================
  // Captura todas las excepciones y devuelve respuestas genéricas.
  // Los errores 500 NUNCA exponen stack traces ni mensajes de BD.
  app.useGlobalFilters(new HttpExceptionFilter());

  // ========================================
  // SEGURIDAD GLOBAL — ClassSerializerInterceptor
  // ========================================
  // Aplica @Exclude() y @Expose() de class-transformer a todas las respuestas.
  // Esto garantiza que campos como 'password' marcados con @Exclude()
  // nunca se incluyan en las respuestas JSON.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // ========================================
  // SWAGGER — Documentación de la API
  // ========================================
  const config = new DocumentBuilder()
    .setTitle('API JABM')
    .setDescription(
      'API REST para gestión de tareas con autenticación JWT, RBAC y auditoría.\n\n' +
      '## Roles del Sistema\n\n' +
      '**ADMIN** — Gestión completa: CRUD de usuarios, asignación/gestión de tareas y consulta de auditoría.\n\n' +
      '**USER** — Consulta únicamente sus tareas asignadas.\n\n' +
      '## Autenticación\n\n' +
      'Usa el botón **Authorize** e ingresa tu token JWT con el formato: `Bearer <tu_token>`',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-Auth',
    )
    .addTag('Autenticación', 'Registro e inicio de sesión — Acceso público')
    .addTag('Usuarios (Admin)', 'CRUD de usuarios — Solo ADMIN')
    .addTag('Tareas', 'Gestión de tareas — ADMIN: CRUD completo | USER: Solo lectura de sus tareas')
    .addTag('Auditoría (Admin)', 'Consulta de logs de seguridad — Solo ADMIN')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API JABM — Documentación',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper .select-label { color: #e2e8f0; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  // ========================================
  // CORS
  // ========================================
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN || '*',
  });

  // ========================================
  // INICIAR SERVIDOR
  // ========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Servidor corriendo en: http://localhost:${port}`);
  logger.log(`Swagger UI disponible en: http://localhost:${port}/api/docs`);
  logger.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
