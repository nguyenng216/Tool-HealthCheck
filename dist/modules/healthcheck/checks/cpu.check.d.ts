import { CheckResult, Device, HealthCheck } from '../interfaces/healthcheck-plugin.interface';
export default class CpuCheck implements HealthCheck {
    name: string;
    category: string;
    run(device: Device): Promise<CheckResult>;
}
