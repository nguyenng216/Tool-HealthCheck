export declare enum SnmpVersion {
    V1 = 0,
    V2c = 1,
    V3 = 3
}
export interface SnmpQuery {
    target: string;
    oid: string;
    type: 'get' | 'walk' | 'interfaceMetrics';
    results: Record<string, unknown>;
    queriedAt: Date;
}
