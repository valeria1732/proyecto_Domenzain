import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateRoleDto, CreateUserDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, GetUser } from '../auth/decorators';
import { Role } from '../common/enums';

@ApiTags('Usuarios (Admin)')
@ApiBearerAuth('JWT-Auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Todas las rutas requieren autenticación
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Lista todos los usuarios. El password se excluye automáticamente
   * por @Exclude() en la entidad + ClassSerializerInterceptor global.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description:
      'Retorna la lista completa de usuarios registrados. ' +
      'La contraseña se excluye automáticamente de la respuesta. ' +
      'Requiere autenticación JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Juan Pérez',
          email: 'juan@jabm.com',
          role: 'USER',
          createdAt: '2026-04-22T10:00:00.000Z',
          updatedAt: '2026-04-22T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado — Token JWT inválido o ausente' })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * POST /users
   * Crea un nuevo usuario manualmente por un Admin.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear usuario (Solo ADMIN)',
    description: 'Permite al administrador crear un usuario y asignarle un rol específico.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado' })
  create(
    @Body() createUserDto: CreateUserDto,
    @GetUser('userId') adminUserId: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.usersService.create(createUserDto, adminUserId, ipAddress);
  }

  /**
   * GET /users/:id
   * Obtiene el perfil de un usuario específico.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna los datos de un usuario específico por su UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Edita el perfil de un usuario.
   * Protección IDOR: solo el propio usuario o un ADMIN puede editar.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar perfil de usuario',
    description:
      'Actualiza nombre y/o email de un usuario. ' +
      'Protección IDOR: solo el propio usuario o un ADMIN puede realizar esta acción.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado — No puedes editar otro usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('userId') requestingUserId: string,
    @GetUser('role') requestingUserRole: Role,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
      requestingUserId,
      requestingUserRole,
    );
  }

  /**
   * PATCH /users/:id/role
   * Cambia el rol de un usuario. Solo ADMIN.
   */
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Cambiar rol de usuario (Solo ADMIN)',
    description:
      'Permite al administrador cambiar el rol de un usuario entre USER y ADMIN. ' +
      'Esta acción queda registrada en el log de auditoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario al que se le cambiará el rol',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @GetUser('userId') adminUserId: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.usersService.updateRole(id, updateRoleDto, adminUserId, ipAddress);
  }

  /**
   * DELETE /users/:id
   * Elimina un usuario. Solo ADMIN.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar usuario (Solo ADMIN)',
    description:
      'Elimina un usuario del sistema permanentemente. ' +
      'Las tareas asociadas se eliminan en cascada. ' +
      'Esta acción queda registrada en el log de auditoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('userId') adminUserId: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.usersService.remove(id, adminUserId, ipAddress);
  }
}
