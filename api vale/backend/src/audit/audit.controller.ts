import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { FilterAuditDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../common/enums';
import { AuditSeverity } from '../common/enums';

@ApiTags('Auditoría (Admin)')
@ApiBearerAuth('JWT-Auth')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit
   * Solo ADMIN puede consultar registros de auditoría.
   * Filtros disponibles por query params:
   *   ?userId=uuid&startDate=2024-01-01&endDate=2024-12-31&severity=WARNING&action=LOGIN_FAILED
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Consultar logs de auditoría (Solo ADMIN)',
    description:
      'Retorna los registros de auditoría del sistema con filtros opcionales. ' +
      'Registra eventos como: login exitoso/fallido, creación/eliminación de usuarios, ' +
      'cambios de rol y eliminación de tareas. Limitado a 500 resultados por consulta.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filtrar por tipo de acción',
    example: 'LOGIN_FAILED',
    enum: [
      'USER_REGISTERED',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'USER_DELETED',
      'ROLE_CHANGED',
      'TASK_DELETED',
    ],
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    description: 'Filtrar por nivel de severidad',
    enum: AuditSeverity,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha inicio del rango (formato ISO 8601)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha fin del rango (formato ISO 8601)',
    example: '2026-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de auditoría obtenidos exitosamente',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: '660e8400-e29b-41d4-a716-446655440000',
          action: 'LOGIN_SUCCESS',
          severity: 'INFO',
          details: 'Login exitoso para admin@jabm.com',
          ipAddress: '::1',
          createdAt: '2026-04-22T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo ADMIN' })
  findAll(@Query() filters: FilterAuditDto) {
    return this.auditService.findAll(filters);
  }
}
