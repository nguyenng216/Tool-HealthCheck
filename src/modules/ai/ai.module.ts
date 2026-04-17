import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DiagnosisEngine } from './diagnosis.engine';

@Module({
  controllers: [AiController],
  providers: [AiService, DiagnosisEngine],
  exports: [AiService],
})
export class AiModule {}
