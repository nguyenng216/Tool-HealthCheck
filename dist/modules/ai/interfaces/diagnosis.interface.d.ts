export type HealthSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export interface AiCheckResult {
    checkName: string;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    metrics: Record<string, unknown>;
    message: string;
}
export interface DiagnosisResult {
    issue: string;
    severity: HealthSeverity;
    root_cause: string;
    recommendation: string;
}
