"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CpuCheck {
    name = 'cpu';
    category = 'system';
    async run(device) {
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
exports.default = CpuCheck;
//# sourceMappingURL=cpu.check.js.map