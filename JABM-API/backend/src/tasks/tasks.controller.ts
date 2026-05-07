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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { GetUser, Roles } from '../auth/decorators';
import { Role } from '../common/enums';

@ApiTags('Tareas')
@ApiBearerAuth('JWT-Auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard) // Todas las rutas requieren autenticación
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * POST /tasks
   * Crea una nueva tarea. El userId se toma del JWT automáticamente.
   */
  @Post()
  @ApiOperation({
    summary: 'Crear nueva tarea (Solo ADMIN)',
    description:
      'Crea una nueva tarea y la asigna al usuario autenticado. ' +
      'El userId se obtiene automáticamente del token JWT (prevención de IDOR). ' +
      'Solo el ADMIN puede crear y asignar tareas.',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Revisar documentación',
        description: 'Revisar la documentación del proyecto antes del deploy',
        status: 'PENDING',
        userId: '660e8400-e29b-41d4-a716-446655440000',
        createdAt: '2026-04-22T10:00:00.000Z',
        updatedAt: '2026-04-22T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('userId') userId: string,
    @GetUser('role') role: Role,
  ) {
    return this.tasksService.create(createTaskDto, userId, role);
  }

  /**
   * GET /tasks
   * Obtiene solo las tareas del usuario autenticado.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar mis tareas',
    description:
      'Retorna únicamente las tareas asignadas al usuario autenticado. ' +
      'ADMIN ve todas las tareas; USER ve solo las suyas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del usuario',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Configurar entorno',
          description: 'Instalar dependencias del proyecto',
          status: 'DONE',
          userId: '660e8400-e29b-41d4-a716-446655440000',
          createdAt: '2026-04-22T10:00:00.000Z',
          updatedAt: '2026-04-22T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@GetUser('userId') userId: string) {
    return this.tasksService.findAllByUser(userId);
  }

  /**
   * GET /tasks/all
   * Obtiene todas las tareas del sistema (Solo ADMIN).
   */
  @Get('all')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar todas las tareas (Solo ADMIN)',
    description: 'Retorna todas las tareas de todos los usuarios registrados en el sistema.',
  })
  @ApiResponse({ status: 200, description: 'Lista de todas las tareas devuelta exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo ADMIN' })
  findAllAll() {
    return this.tasksService.findAllAll();
  }

  /**
   * GET /tasks/:id
   * Obtiene una tarea con verificación de propiedad.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tarea por ID',
    description:
      'Retorna una tarea específica. ' +
      'Verificación de propiedad: solo el dueño de la tarea o un ADMIN pueden acceder.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Tarea encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado — La tarea no te pertenece' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('userId') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.tasksService.findOne(id, userId, userRole);
  }

  /**
   * PATCH /tasks/:id
   * Actualiza una tarea con verificación de propiedad.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tarea (Solo ADMIN)',
    description:
      'Actualiza los datos de una tarea existente (título, descripción, estado). ' +
      'Verificación de propiedad: solo el dueño o un ADMIN pueden modificar.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('userId') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId, userRole);
  }

  /**
   * DELETE /tasks/:id
   * Elimina una tarea con verificación de propiedad y registro en auditoría.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar tarea (Solo ADMIN)',
    description:
      'Elimina una tarea permanentemente. ' +
      'Solo el dueño o un ADMIN pueden eliminarla. ' +
      'La acción queda registrada en el log de auditoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('userId') userId: string,
    @GetUser('role') userRole: Role,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.tasksService.remove(id, userId, userRole, ipAddress);
  }
}
