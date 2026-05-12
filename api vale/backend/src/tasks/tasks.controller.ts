import {
  Controller, Get, Patch, Param, Body,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Tareas')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener mis tareas',
    description: 'Solo USER. Devuelve ÚNICAMENTE las tareas del usuario autenticado. NUNCA tareas de otros usuarios.',
  })
  @ApiResponse({ status: 200, description: 'Lista de tareas propias' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @ApiResponse({ status: 403, description: 'Solo rol USER' })
  findMyTasks(@CurrentUser() user: JwtPayload) {
    return this.tasksService.findMyTasks(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tarea por ID',
    description: 'Solo USER. 404 si no pertenece al usuario (no confirma existencia).',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la tarea' })
  @ApiResponse({ status: 404, description: 'No encontrada (o no pertenece al usuario)' })
  findMyTaskById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findMyTaskById(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Marcar tarea como completada/pendiente',
    description: 'Solo USER. Solo actualiza el campo "completed". Anti-IDOR enforced.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  updateMyTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.updateMyTask(id, dto, user);
  }
}
