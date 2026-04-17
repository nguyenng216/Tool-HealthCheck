export declare enum ExecutionMode {
    Parallel = "parallel",
    Sequence = "sequence"
}
export declare class RunHealthcheckDto {
    deviceId: number;
    policy?: string;
    mode?: ExecutionMode;
}
