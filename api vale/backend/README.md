# API-JABM Backend

API REST segura construida con **NestJS**, **TypeORM** y **PostgreSQL**.

## 🛡️ Características de Seguridad

- **Autenticación JWT** con Passport.js
- **Autorización RBAC** (Role-Based Access Control) con guards
- **Hasheo de contraseñas** con Argon2 (resistente a ataques GPU/ASIC)
- **Validación estricta** con class-validator (whitelist + forbidNonWhitelisted)
- **Protección IDOR** en todas las operaciones de usuario y tareas
- **Exclusión de datos sensibles** con @Exclude() + ClassSerializerInterceptor
- **HttpExceptionFilter global** que oculta stack traces en errores 500
- **Sistema de auditoría** completo con registros de eventos de seguridad
- **Prepared statements** vía TypeORM (protección contra SQL injection)

## 📋 Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 3. Crear la base de datos en PostgreSQL
# CREATE DATABASE api_jabm;

# 4. Iniciar en modo desarrollo (las tablas se crean automáticamente con synchronize: true)
npm run start:dev
```

## 🔑 Variables de Entorno

| Variable | Descripción | Default |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `password` |
| `DB_DATABASE` | Nombre de la base de datos | `api_jabm` |
| `JWT_SECRET` | Secreto para firmar JWT | - |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `60m` |
| `PORT` | Puerto del servidor | `3000` |
| `ALLOWED_ORIGIN` | Origen CORS permitido | `http://localhost:4200` |
| `NODE_ENV` | Entorno de ejecución | `development` |

## 📡 Endpoints

### Auth
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |

### Users
| Método | Ruta | Descripción | Auth | Rol |
|---|---|---|---|---|
| GET | `/users` | Listar usuarios | Sí | Cualquiera |
| GET | `/users/:id` | Ver perfil | Sí | Cualquiera |
| PATCH | `/users/:id` | Editar perfil | Sí | Owner/ADMIN |
| PATCH | `/users/:id/role` | Cambiar rol | Sí | ADMIN |
| DELETE | `/users/:id` | Eliminar usuario | Sí | ADMIN |

### Tasks
| Método | Ruta | Descripción | Auth | Acceso |
|---|---|---|---|---|
| POST | `/tasks` | Crear tarea | Sí | Owner |
| GET | `/tasks` | Listar mis tareas | Sí | Owner |
| GET | `/tasks/:id` | Ver tarea | Sí | Owner |
| PATCH | `/tasks/:id` | Editar tarea | Sí | Owner |
| DELETE | `/tasks/:id` | Eliminar tarea | Sí | Owner |

### Audit
| Método | Ruta | Descripción | Auth | Rol |
|---|---|---|---|---|
| GET | `/audit` | Ver registros de auditoría | Sí | ADMIN |

**Filtros de auditoría**: `?userId=&startDate=&endDate=&severity=&action=`

## 📁 Estructura del Proyecto

```
src/
├── auth/
│   ├── decorators/       # @Roles(), @GetUser()
│   ├── dto/              # RegisterDto, LoginDto
│   ├── guards/           # JwtAuthGuard, RolesGuard
│   ├── strategies/       # JwtStrategy (Passport)
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/              # UpdateUserDto, UpdateRoleDto, UserResponseDto
│   ├── entities/         # User entity
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── tasks/
│   ├── dto/              # CreateTaskDto, UpdateTaskDto
│   ├── entities/         # Task entity
│   ├── tasks.controller.ts
│   ├── tasks.module.ts
│   └── tasks.service.ts
├── audit/
│   ├── dto/              # FilterAuditDto
│   ├── entities/         # AuditLog entity
│   ├── audit.controller.ts
│   ├── audit.module.ts
│   └── audit.service.ts
├── common/
│   ├── enums/            # Role, TaskStatus, AuditSeverity
│   └── filters/          # HttpExceptionFilter
├── config/               # database.config.ts, jwt.config.ts
├── app.module.ts
└── main.ts
```

## 🧪 Scripts disponibles

```bash
npm run start:dev     # Desarrollo con hot-reload
npm run start         # Producción
npm run build         # Compilar TypeScript
npm run test          # Tests unitarios
npm run lint          # Linting
```
