import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ example: true, description: 'Marcar como completada (true) o pendiente (false)', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El campo "completed" debe ser verdadero o falso' })
  completed?: boolean;
}
