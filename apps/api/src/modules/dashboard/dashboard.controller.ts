import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // GET /dashboard/summary
  @Get('summary')
  async getSummary(@Request() request: any) {
    const psicologoId = request.user?.id;
    if (!psicologoId) {
      return {
        todayCount: 0,
        todayAgenda: [],
        recentPatients: [],
        message: 'Usuário não autenticado',
      };
    }

    const summary = await this.dashboardService.getTodaySummary(psicologoId);
    return summary;
  }
}
