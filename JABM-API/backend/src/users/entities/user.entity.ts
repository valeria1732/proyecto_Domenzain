import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums';
import { Task } from '../../tasks/entities/task.entity';

/**
 * Entidad de usuario.
 *
 * Seguridad:
 * - La contraseña se excluye automáticamente de todas las respuestas JSON
 *   mediante @Exclude() + ClassSerializerInterceptor global.
 * - El rol por defecto es USER; solo un ADMIN puede cambiarlo (protección IDOR).
 * - El email es único para evitar cuentas duplicadas.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * Contraseña hasheada con Argon2.
   * @Exclude() previene que se serialice en respuestas HTTP,
   * mitigando la exposición accidental de datos sensibles.
   */
  @Exclude()
  @Column({ type: 'text' })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relación: un usuario puede tener muchas tareas
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
