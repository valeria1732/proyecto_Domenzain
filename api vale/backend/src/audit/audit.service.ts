import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog } from '@prisma/client';

export const AuditAction = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  TASK_VIEWED: 'TASK_VIEWED',
  TASK_COMPLETED: 'TASK_COMPLETED',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

export interface CreateAuditLogDto {
  action: AuditActionType;
  entity: string;
  entityId?: number;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entity: data.entity,
          entityId: data.entityId ?? null,
          userId: data.userId ?? null,
          username: data.username ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          details: data.details ?? null,
        },
      });
    } catch (error) {
      this.logger.error('Error al registrar log de auditoría', error);
    }
  }

  async findAll(): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findByUser(userId: number): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
