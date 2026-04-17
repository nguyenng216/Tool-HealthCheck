import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckService } from './healthcheck.service';
import { HealthcheckEngine } from './healthcheck.engine';

@Module({
  imports: [AiModule],
  controllers: [HealthcheckController],
  providers: [HealthcheckService, HealthcheckEngine],
  exports: [HealthcheckService],
})
export class HealthcheckModule {}
