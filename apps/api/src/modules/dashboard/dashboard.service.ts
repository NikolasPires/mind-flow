import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { EncryptionService } from "src/modules/services/encryptionService";

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService
  ) {}

  private getDayRange(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  async getTodaySummary(psicologoId: string) {
    const { start, end } = this.getDayRange();

    // total de sessões hoje
    const todayCount = await this.prisma.consulta.count({
      where: {
        horario: { gte: start, lte: end },
        paciente: { psicologo_responsavel_id: psicologoId },
      },
    });

    // agenda do dia (detalhes)
    let todayAgenda = await this.prisma.consulta.findMany({
      where: {
        horario: { gte: start, lte: end },
        paciente: { psicologo_responsavel_id: psicologoId },
      },
      orderBy: { horario: 'asc' },
      include: {
        paciente: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      take: 50,
    });

    // pacientes recentes (baseado em updatedAt do paciente)
    let recentPatients = await this.prisma.paciente.findMany({
      where: {
        psicologo_responsavel_id: psicologoId,
      },

      take: 3,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // 🔓 DESCRIPTOGRAFIA DOS DADOS DA AGENDA 🔓
    todayAgenda = todayAgenda.map((consulta) => {
      try {
        const user = consulta.paciente.user;
        user.name = this.encryption.decrypt(user.name);
        user.email = this.encryption.decrypt(user.email);
      } catch (e) {
        console.warn('Falha ao descriptografar paciente na agenda:', e);
      }
      return consulta;
    });

    recentPatients = recentPatients.map((paciente) => {
      try {
        const user = paciente.user;
        user.name = this.encryption.decrypt(user.name);
        user.email = this.encryption.decrypt(user.email);
      } catch (e) {
        console.warn('Falha ao descriptografar paciente recente:', e);
      }
      return paciente;
    });

    return {
      todayCount,
      todayAgenda,
      recentPatients,
    };
  }
}