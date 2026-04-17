import { DiagnoseDto } from './dto/diagnose.dto';
import { DiagnosisEngine } from './diagnosis.engine';
import { DiagnosisResult } from './interfaces/diagnosis.interface';
export declare class AiService {
    private readonly diagnosisEngine;
    constructor(diagnosisEngine: DiagnosisEngine);
    analyze(payload: DiagnoseDto): Promise<DiagnosisResult>;
}
