"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryCheck {
    name = 'memory';
    category = 'system';
    async run(device) {
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
exports.default = MemoryCheck;
//# sourceMappingURL=memory.check.js.map