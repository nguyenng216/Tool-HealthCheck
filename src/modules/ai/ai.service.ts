import { Injectable } from '@nestjs/common';
import { DiagnoseDto } from './dto/diagnose.dto';
import { DiagnosisEngine } from './diagnosis.engine';
import { DiagnosisResult } from './interfaces/diagnosis.interface';

@Injectable()
export class AiService {
  constructor(private readonly diagnosisEngine: DiagnosisEngine) {}

  async analyze(payload: DiagnoseDto): Promise<DiagnosisResult> {
    return this.diagnosisEngine.evaluate(payload.checks);
  }
}
