import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../common/enums';

/**
 * DTO para actualización parcial de tarea.
 * Todos los campos son opcionales (PATCH).
 */
export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la tarea',
    example: 'Título actualizado de la tarea',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'El título debe tener máximo 255 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la tarea',
    example: 'Descripción actualizada con más detalles',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado de la tarea',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    enumName: 'TaskStatus',
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'El estado debe ser PENDING, IN_PROGRESS o DONE',
  })
  status?: TaskStatus;
}
