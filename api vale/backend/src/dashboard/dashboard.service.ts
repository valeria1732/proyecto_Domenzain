import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { TaskStatus } from '../common/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getStats() {
    const [totalUsers, activeTasks, completedTasks, alertsCount] = await Promise.all([
      this.usersRepository.count(),
      this.tasksRepository.count({
        where: { status: Not(TaskStatus.DONE) },
      }),
      this.tasksRepository.count({
        where: { status: TaskStatus.DONE },
      }),
      this.auditLogRepository.count(), // Por ahora tomamos todos los logs como 'alertas' del sistema
    ]);

    return {
      totalUsers,
      activeTasks,
      completedTasks,
      alertsCount,
    };
  }
}
