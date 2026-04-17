import { CheckResult, Device, HealthCheck } from './interfaces/healthcheck-plugin.interface';
export declare class HealthcheckEngine {
    private readonly logger;
    private readonly plugins;
    constructor();
    private resolvePluginExport;
    private loadPlugins;
    getPlugins(): HealthCheck[];
    run(device: Device, mode?: 'parallel' | 'sequence'): Promise<CheckResult[]>;
}
