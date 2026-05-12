import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * ANTI-IDOR: Filtra SIEMPRE por userId del JWT.
   * NUNCA se devuelven tareas globales.
   */
  async findMyTasks(user: JwtPayload) {
    return this.prisma.task.findMany({
      where: {
        userId: user.sub, // OBLIGATORIO — nunca omitir
      },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * ANTI-IDOR: Filtra por id Y userId simultáneamente.
   * Tarea de otro usuario → 404 (no confirma existencia).
   */
  async findMyTaskById(taskId: number, user: JwtPayload) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId: user.sub, // OBLIGATORIO — doble filtro anti-IDOR
      },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    return task;
  }

  async updateMyTask(taskId: number, dto: UpdateTaskDto, user: JwtPayload) {
    // Verificar ownership antes de actualizar
    const existingTask = await this.prisma.task.findFirst({
      where: { id: taskId, userId: user.sub },
      select: { id: true, completed: true },
    });

    if (!existingTask) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { completed: dto.completed },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.auditService.log({
      action: AuditAction.TASK_COMPLETED,
      entity: 'Task',
      entityId: taskId,
      userId: user.sub,
      username: user.username,
      details: JSON.stringify({
        previousCompleted: existingTask.completed,
        newCompleted: dto.completed,
      }),
    });

    return updatedTask;
  }
}
