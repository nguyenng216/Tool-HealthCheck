export interface Device {
    id: number;
    name: string;
    ip: string;
    type: string;
    metadata?: Record<string, unknown>;
    credentials?: {
        username: string;
        password: string;
    };
}
export type HealthStatus = 'OK' | 'WARNING' | 'CRITICAL';
export interface CheckResult {
    checkName: string;
    status: HealthStatus;
    metrics: Record<string, unknown>;
    message: string;
}
export interface HealthCheck {
    name: string;
    category: string;
    run(device: Device): Promise<CheckResult>;
}
