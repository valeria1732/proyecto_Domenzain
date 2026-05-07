import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditSeverity } from '../../common/enums';

/**
 * DTO para filtrar registros de auditoría.
 * Todos los campos son opcionales — actúan como filtros por query params.
 */
export class FilterAuditDto {
  @ApiPropertyOptional({
    description: 'UUID del usuario para filtrar sus eventos',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (formato ISO 8601)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'startDate debe tener formato ISO 8601' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (formato ISO 8601)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate debe tener formato ISO 8601' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Nivel de severidad del evento',
    enum: AuditSeverity,
    enumName: 'AuditSeverity',
  })
  @IsOptional()
  @IsEnum(AuditSeverity, {
    message: 'severity debe ser INFO, WARNING, ERROR o CRITICAL',
  })
  severity?: AuditSeverity;

  @ApiPropertyOptional({
    description: 'Tipo de acción registrada',
    example: 'LOGIN_FAILED',
  })
  @IsOptional()
  @IsString()
  action?: string;
}
