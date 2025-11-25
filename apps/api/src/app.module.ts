import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConsultaModule } from './modules/consulta/consulta.module';
import { TranscricaoModule } from './modules/transcricao/transcricao.module';
import { PacienteModule } from './modules/paciente/paciente.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwtAuth.guard';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true, 
    }), DatabaseModule, UserModule, AuthModule, ConsultaModule, TranscricaoModule,PacienteModule, DashboardModule],
  controllers: [AppController],
  providers: [
    AppService,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
})
export class AppModule {}
