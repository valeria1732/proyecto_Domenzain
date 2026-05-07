import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditSeverity } from '../common/enums';
import { FilterAuditDto } from './dto';

/**
 * Interfaz para los datos de un registro de auditoría.
 */
interface AuditLogData {
  userId?: string | null;
  action: string;
  severity: AuditSeverity;
  details?: string | null;
  ipAddress?: string | null;
}

/**
 * AuditService — servicio inyectable en cualquier módulo para registrar eventos.
 *
 * Uso:
 *   await this.auditService.log({
 *     userId: 'uuid',
 *     action: 'LOGIN_FAILED',
 *     severity: AuditSeverity.WARNING,
 *     details: 'Contraseña incorrecta',
 *     ipAddress: '192.168.1.1',
 *   });
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Registra un evento de auditoría.
   * Este método NO lanza excepciones — los errores de auditoría
   * se registran en el logger pero no interrumpen el flujo principal.
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: data.userId || null,
        action: data.action,
        severity: data.severity,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // No lanzar error — la auditoría no debe romper el flujo de negocio
      this.logger.error(
        `Error al registrar auditoría: ${error instanceof Error ? error.message : 'Unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Obtener registros de auditoría con filtros opcionales.
   * Solo accesible por ADMIN (controlado en el controlador).
   */
  async findAll(filters: FilterAuditDto): Promise<AuditLog[]> {
    const where: Record<string, any> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    // Filtro por rango de fechas
    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(filters.startDate));
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(new Date(filters.endDate));
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 500, // Limitar resultados para prevenir sobrecarga
    });
  }
}
