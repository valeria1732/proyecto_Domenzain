import { Controller, Get, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Auditoría (Admin)')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los logs de auditoría', description: 'Solo ADMIN. Últimos 500 eventos.' })
  @ApiResponse({ status: 200, description: 'Lista de logs' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo ADMIN' })
  findAll() {
    return this.auditService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Logs de un usuario', description: 'Solo ADMIN.' })
  @ApiResponse({ status: 200, description: 'Logs del usuario' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.auditService.findByUser(userId);
  }
}
