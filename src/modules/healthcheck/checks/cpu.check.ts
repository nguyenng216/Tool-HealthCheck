import { CheckResult, Device, HealthCheck } from '../interfaces/healthcheck-plugin.interface';

export default class CpuCheck implements HealthCheck {
  name = 'cpu';
  category = 'system';

  async run(device: Device): Promise<CheckResult> {
    const load = Math.round(Math.random() * 100);
    const status = load < 70 ? 'OK' : load < 90 ? 'WARNING' : 'CRITICAL';

    return {
      checkName: this.name,
      status,
      metrics: {
        cpuLoad: load,
        threshold: { warning: 70, critical: 90 },
        deviceIp: device.ip,
      },
      message: `Device ${device.name} CPU load is ${load}%`,
    };
  }
}
