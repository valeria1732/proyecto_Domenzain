import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { AuditSeverity, Role } from '../common/enums';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Crear una nueva tarea.
   * El userId se asigna automáticamente desde el JWT,
   * NUNCA desde el body del request (prevención de IDOR).
   */
  async create(createTaskDto: CreateTaskDto, userId: string, role: Role): Promise<Task> {
    const assignToUserId = (role === Role.ADMIN && createTaskDto.userId) ? createTaskDto.userId : userId;
    
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId: assignToUserId,
    });

    const savedTask = await this.taskRepository.save(task);
    this.logger.log(`Tarea creada: ${savedTask.id} por usuario ${userId}`);

    return savedTask;
  }

  /**
   * Obtener todas las tareas del usuario autenticado.
   * Un usuario solo puede ver sus propias tareas (aislamiento de datos).
   */
  async findAllByUser(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener todas las tareas (Solo ADMIN)
   */
  async findAllAll(): Promise<Task[]> {
    return this.taskRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una tarea por ID con verificación de propiedad.
   *
   * Seguridad IDOR:
   * - Se verifica que la tarea pertenezca al usuario autenticado.
   * - Si el ID existe pero no pertenece al usuario, se lanza 403.
   */
  async findOne(id: string, userId: string, userRole: Role): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    // Verificación de propiedad: solo el dueño o un ADMIN puede acceder
    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes acceso a esta tarea');
    }

    return task;
  }

  /**
   * Actualizar una tarea con verificación de propiedad.
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    userRole: Role,
  ): Promise<Task> {
    const task = await this.findOne(id, userId, userRole);

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    this.logger.log(`Tarea actualizada: ${id} por usuario ${userId}`);

    return updatedTask;
  }

  /**
   * Eliminar una tarea con verificación de propiedad y registro en auditoría.
   */
  async remove(
    id: string,
    userId: string,
    userRole: Role,
    ipAddress: string | null,
  ): Promise<{ message: string }> {
    const task = await this.findOne(id, userId, userRole);

    await this.taskRepository.remove(task);

    // Registrar eliminación de tarea en auditoría
    await this.auditService.log({
      userId,
      action: 'TASK_DELETED',
      severity: AuditSeverity.INFO,
      details: `Tarea eliminada: "${task.title}" (ID: ${id}) por usuario ${userId}`,
      ipAddress,
    });

    this.logger.log(`Tarea eliminada: ${id} por usuario ${userId}`);

    return { message: `Tarea "${task.title}" eliminada exitosamente` };
  }
}
