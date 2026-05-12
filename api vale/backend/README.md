# API Vale — Backend

Backend REST seguro construido con **NestJS**, **Prisma ORM** y **PostgreSQL**.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| NestJS | 10.x | Framework backend |
| TypeScript | 5.x | Tipado estático |
| Prisma ORM | 5.x | Acceso a base de datos |
| PostgreSQL | 14+ | Base de datos |
| Argon2id | - | Hash de contraseñas |
| JWT | - | Autenticación stateless |
| Helmet | 8.x | Headers de seguridad HTTP |

---

## Configuración Inicial

### 1. Requisitos previos

- Node.js 18+
- PostgreSQL 14+ corriendo localmente
- Base de datos `api_vale_db` creada

```sql
-- En psql o pgAdmin:
CREATE DATABASE api_vale_db;
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Contenido del `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_vale_db"
JWT_SECRET="cambiar_este_secreto_en_produccion_por_algo_muy_largo_y_aleatorio"
JWT_EXPIRES_IN="15m"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev --name init
```

Esto creará las tablas `users`, `tasks` y `audit_logs` en PostgreSQL.

### 5. Insertar datos de prueba (opcional)

Las tareas se insertan directamente en la BD (no desde la API).
Ejemplo SQL para datos de prueba:

```sql
-- Crear usuario ADMIN (contraseña debe ser hasheada con argon2 antes de insertar)
-- Usar el endpoint POST /api/v1/users desde Swagger después de crear el primer admin

-- Insertar tareas directamente en BD (regla de negocio: no se crean desde la API)
INSERT INTO tasks (name, description, priority, completed, "userId", "createdAt", "updatedAt")
VALUES 
  ('Revisar documentación', 'Revisar el manual de procedimientos Q2', true, false, 1, NOW(), NOW()),
  ('Actualizar reportes', 'Completar los reportes del mes', false, false, 1, NOW(), NOW());
```

### 6. Iniciar el servidor

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

---

## Endpoints

La API base URL es: `http://localhost:3000/api/v1`

### Autenticación (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Login → devuelve JWT (15min) |
| `POST` | `/auth/logout` | Registra logout (requiere JWT) |
| `GET` | `/auth/me` | Perfil del usuario autenticado |

### Usuarios (solo ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/users` | Listar todos los usuarios |
| `GET` | `/users/:id` | Ver usuario por ID |
| `POST` | `/users` | Crear usuario |
| `PUT` | `/users/:id` | Editar usuario (nombre, apellido, password, rol) |
| `DELETE` | `/users/:id` | Eliminar usuario (falla si tiene tareas) |

### Tareas (solo USER autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/tasks` | Mis tareas (filtradas por usuario del JWT) |
| `GET` | `/tasks/:id` | Mi tarea por ID (404 si no es del usuario) |
| `PATCH` | `/tasks/:id` | Actualizar estado `completed` de mi tarea |

### Auditoría (solo ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/audit` | Últimos 500 logs de auditoría |
| `GET` | `/audit/user/:userId` | Logs de un usuario específico |

---

## Documentación Swagger

Disponible en: `http://localhost:3000/api/docs`

---

## Seguridad Implementada

### Autenticación
- JWT con expiración de **15 minutos**
- Contraseñas hasheadas con **Argon2id** (resistente a ataques de GPU/ASIC)
- Mensajes de error genéricos en login (previene enumeración de usuarios)
- Prevención de **timing attacks** (verificación de hash ficticio cuando usuario no existe)

### Autorización (RBAC)
- **ADMIN**: CRUD de usuarios, consulta de auditoría
- **USER**: Solo consulta sus propias tareas
- Guards en todos los endpoints protegidos

### Anti-IDOR
- **TODAS** las queries de tareas filtran por `userId = jwtUser.sub`
- Imposible acceder a tareas de otro usuario aunque se manipule el ID
- Tarea de otro usuario → 404 (no revela que existe)

### Protección HTTP
- **Helmet**: headers de seguridad HTTP estándar
- **CORS**: configurado por `ALLOWED_ORIGIN`
- **ValidationPipe**: whitelist + forbidNonWhitelisted (previene mass assignment)
- Sin stack traces en errores 500

### Auditoría
Los siguientes eventos se registran en `audit_logs`:
- `LOGIN_SUCCESS` / `LOGIN_FAILED`
- `LOGOUT`
- `USER_CREATED` / `USER_UPDATED` / `USER_DELETED`
- `USER_ROLE_CHANGED` (registra rol anterior y nuevo)
- `TASK_COMPLETED`

Los logs son **inmutables desde la API** (no hay endpoints de modificación).

---

## Comandos Útiles

```bash
# Ver las tablas en Prisma Studio
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Regenerar el cliente Prisma
npm run prisma:generate

# Build de producción
npm run build
```

---

## Estructura del Proyecto

```
src/
├── main.ts                          # Bootstrap (Helmet, CORS, Swagger, ValidationPipe)
├── app.module.ts                    # Módulo raíz
├── config/
│   └── index.ts                     # Configuración centralizada (env vars)
├── prisma/
│   ├── prisma.module.ts             # Módulo global de Prisma
│   └── prisma.service.ts            # PrismaClient wrapper con lifecycle hooks
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts  # @CurrentUser()
│   │   └── roles.decorator.ts         # @Roles()
│   ├── enums/
│   │   └── role.enum.ts               # Role.USER | Role.ADMIN
│   ├── filters/
│   │   └── http-exception.filter.ts   # Sin stack traces en 500
│   ├── guards/
│   │   ├── jwt-auth.guard.ts          # Verifica JWT
│   │   └── roles.guard.ts             # Verifica rol (RBAC)
│   └── interfaces/
│       └── jwt-payload.interface.ts   # Estructura del JWT payload
├── auth/
│   ├── dto/login.dto.ts
│   ├── auth.service.ts               # Login (argon2 verify, timing attack prevention)
│   ├── auth.controller.ts            # POST /login, POST /logout, GET /me
│   └── auth.module.ts
├── users/
│   ├── dto/create-user.dto.ts
│   ├── dto/update-user.dto.ts
│   ├── users.service.ts              # CRUD con argon2 hash + auditoría
│   ├── users.controller.ts           # Solo ADMIN
│   └── users.module.ts
├── tasks/
│   ├── dto/update-task.dto.ts        # Solo campo "completed"
│   ├── tasks.service.ts              # Anti-IDOR: siempre filtra por userId del JWT
│   ├── tasks.controller.ts           # Solo USER
│   └── tasks.module.ts
└── audit/
    ├── audit.service.ts              # log() + findAll() + findByUser()
    ├── audit.controller.ts           # Solo ADMIN, solo lectura
    └── audit.module.ts
```
