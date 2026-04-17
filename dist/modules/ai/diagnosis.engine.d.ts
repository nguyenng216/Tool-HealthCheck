import { AiCheckResult, DiagnosisResult } from './interfaces/diagnosis.interface';
export declare class DiagnosisEngine {
    private readonly logger;
    private readonly rules;
    evaluate(checks: AiCheckResult[]): DiagnosisResult;
    private fallbackDiagnosis;
    private buildSignals;
    private findCheck;
    private toNumber;
    private toBoolean;
    private detectSpeedMismatch;
}
