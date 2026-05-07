import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, AuditLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
