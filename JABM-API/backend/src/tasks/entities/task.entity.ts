import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad de tarea.
 *
 * Seguridad:
 * - Cada tarea pertenece a un usuario (ManyToOne).
 * - La verificación de propiedad se realiza en el servicio antes de
 *   permitir lectura, actualización o eliminación (prevención de IDOR).
 * - El userId se asigna automáticamente desde el JWT, nunca desde el body.
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ name: 'user_id' })
  userId: string;

  // Relación: muchas tareas pertenecen a un usuario
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
