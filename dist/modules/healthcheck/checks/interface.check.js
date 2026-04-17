"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InterfaceCheck {
    name = 'interface';
    category = 'network';
    async run(device) {
        const up = Math.random() > 0.1;
        const errorRate = parseFloat((Math.random() * 2).toFixed(2));
        const status = up && errorRate < 1 ? 'OK' : errorRate < 1.5 ? 'WARNING' : 'CRITICAL';
        return {
            checkName: this.name,
            status,
            metrics: {
                interfaceUp: up,
                errorRate,
                deviceIp: device.ip,
            },
            message: `Interface check for ${device.name} returned ${status}`,
        };
    }
}
exports.default = InterfaceCheck;
//# sourceMappingURL=interface.check.js.map