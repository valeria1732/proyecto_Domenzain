import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../common/enums';

/**
 * DTO para creación de tarea.
 * El userId NO se incluye aquí — se toma automáticamente del JWT
 * para prevenir que un usuario cree tareas a nombre de otro (IDOR).
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Revisar documentación del proyecto',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título debe tener máximo 255 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Revisar y actualizar la documentación técnica antes del deploy a producción',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la tarea',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    example: TaskStatus.PENDING,
    enumName: 'TaskStatus',
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'El estado debe ser PENDING, IN_PROGRESS o DONE',
  })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'UUID del usuario al que se asigna la tarea (solo ADMIN). Si no se envía, se asigna al usuario autenticado.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId?: string;
}
