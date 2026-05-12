import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Módulos de infraestructura
import { PrismaModule } from './prisma/prisma.module';

// Módulos de la aplicación
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';

/**
 * AppModule — Módulo raíz de la aplicación.
 *
 * Arquitectura:
 * - ConfigModule (global): carga .env automáticamente
 * - PrismaModule (global): PrismaService disponible en todos los módulos
 * - AuditModule: exportado y usado por Auth, Users y Tasks
 * - AuthModule: login, logout, me
 * - UsersModule: CRUD de usuarios (solo ADMIN)
 * - TasksModule: consulta de tareas propias (solo USER)
 */
@Module({
  imports: [
    // Cargar variables de entorno globalmente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prisma global — disponible en todos los módulos sin importar PrismaModule
    PrismaModule,

    // Módulos de funcionalidad
    AuditModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
