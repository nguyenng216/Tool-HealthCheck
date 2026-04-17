export interface Healthcheck {
    id: number;
    deviceId: number;
    status: string;
    startedAt: Date;
    endedAt?: Date | null;
    details?: Record<string, unknown> | null;
    createdAt: Date;
}
