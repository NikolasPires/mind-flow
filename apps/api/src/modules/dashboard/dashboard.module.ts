import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { EncryptionService } from '../services/encryptionService';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService, EncryptionService],
})
export class DashboardModule {}
