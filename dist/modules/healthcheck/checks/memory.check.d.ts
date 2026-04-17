import { CheckResult, Device, HealthCheck } from '../interfaces/healthcheck-plugin.interface';
export default class MemoryCheck implements HealthCheck {
    name: string;
    category: string;
    run(device: Device): Promise<CheckResult>;
}
