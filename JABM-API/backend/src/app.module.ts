import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { databaseConfig, jwtConfig } from './config';

// Entities
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { AuditLog } from './audit/entities/audit-log.entity';

@Module({
  imports: [
    // Configuración global — carga .env automáticamente
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),

    // TypeORM — conexión a PostgreSQL (mismo motor que el proyecto de referencia)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [User, Task, AuditLog],
        /**
         * synchronize: true solo en desarrollo.
         * En producción SIEMPRE usar migraciones para evitar
         * pérdida accidental de datos por cambios en entidades.
         */
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
    DashboardModule,
  ],
})
export class AppModule {}
