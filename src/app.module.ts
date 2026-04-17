import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { DevicesModule } from './modules/devices/devices.module';
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SnmpModule } from './modules/snmp/snmp.module';
import { SshModule } from './modules/ssh/ssh.module';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    DevicesModule,
    HealthcheckModule,
    SshModule,
    SnmpModule,
    AiModule,
    ReportsModule,
  ],
})
export class AppModule {}
