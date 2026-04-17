import { CheckResult, Device, HealthCheck } from '../interfaces/healthcheck-plugin.interface';

export default class MemoryCheck implements HealthCheck {
  name = 'memory';
  category = 'system';

  async run(device: Device): Promise<CheckResult> {
    const used = Math.round(Math.random() * 100);
    const status = used < 65 ? 'OK' : used < 85 ? 'WARNING' : 'CRITICAL';

    return {
      checkName: this.name,
      status,
      metrics: {
        memoryUsedPercent: used,
        memoryFreePercent: 100 - used,
        deviceType: device.type,
      },
      message: `Device ${device.name} memory usage is ${used}%`,
    };
  }
}
