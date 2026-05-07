import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AuditSeverity } from '../../common/enums';

/**
 * Entidad de registro de auditoría.
 *
 * Registra eventos relevantes de seguridad como:
 * - Intentos de login (exitosos y fallidos)
 * - Creación/eliminación de usuarios
 * - Eliminación de tareas
 * - Cambios de rol
 *
 * Solo los ADMIN pueden consultar estos registros (protegido por RolesGuard).
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, name: 'user_id' })
  userId: string | null;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO,
  })
  severity: AuditSeverity;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
