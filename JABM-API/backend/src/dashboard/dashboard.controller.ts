import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../common/enums';

@ApiTags('Dashboard (Admin)')
@ApiBearerAuth('JWT-Auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas del dashboard (Solo ADMIN)',
    description: 'Devuelve métricas agregadas como total de usuarios, tareas activas, tareas completadas, y total de alertas.',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo ADMIN' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
