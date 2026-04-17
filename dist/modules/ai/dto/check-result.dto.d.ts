export declare class CheckResultDto {
    checkName: string;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    metrics: Record<string, unknown>;
    message: string;
}
