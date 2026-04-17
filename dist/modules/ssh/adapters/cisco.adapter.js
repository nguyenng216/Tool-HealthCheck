"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiscoAdapter = void 0;
class CiscoAdapter {
    static commandMap = {
        showVersion: 'show version',
        showIpInterfaceBrief: 'show ip interface brief',
        showInterfacesStatus: 'show interfaces status',
    };
    getCommand(key) {
        return CiscoAdapter.getCommand(key);
    }
    parseOutput(commandKey, output) {
        return CiscoAdapter.parseOutput(commandKey, output);
    }
    static getCommand(key) {
        const command = this.commandMap[key];
        if (!command) {
            throw new Error(`Unsupported Cisco command key: ${key}`);
        }
        return command;
    }
    static parseOutput(commandKey, output) {
        switch (commandKey) {
            case 'showVersion':
                return this.parseShowVersion(output);
            case 'showIpInterfaceBrief':
                return this.parseInterfaceBrief(output);
            case 'showInterfacesStatus':
                return this.parseInterfacesStatus(output);
            default:
                return { raw: output };
        }
    }
    static parseShowVersion(output) {
        const lines = output.split(/\r?\n/);
        const result = {};
        lines.forEach((line) => {
            if (/Cisco IOS Software/i.test(line)) {
                result.os = line.trim();
            }
            const versionMatch = line.match(/Version\s+([\d.()A-Za-z-]+)/i);
            if (versionMatch) {
                result.version = versionMatch[1];
            }
            const uptimeMatch = line.match(/uptime is\s+(.+)$/i);
            if (uptimeMatch) {
                result.uptime = uptimeMatch[1].trim();
            }
        });
        return result;
    }
    static parseInterfaceBrief(output) {
        const lines = output.split(/\r?\n/);
        const interfaces = lines
            .filter((line) => /^[A-Za-z]/.test(line) && !line.startsWith('Interface'))
            .map((line) => {
            const parts = line.trim().split(/\s+/);
            return {
                interface: parts[0],
                ipAddress: parts[1],
                status: parts[4],
                protocol: parts[5],
            };
        });
        return { interfaces };
    }
    static parseInterfacesStatus(output) {
        const lines = output.split(/\r?\n/);
        const interfaces = lines
            .filter((line) => /^[A-Za-z]/.test(line) && !line.startsWith('Port'))
            .map((line) => {
            const parts = line.trim().split(/\s+/);
            return {
                port: parts[0],
                name: parts[1],
                status: parts[2],
                vlan: parts[3],
                duplex: parts[4],
                speed: parts[5],
                type: parts.slice(6).join(' '),
            };
        });
        return { interfaces };
    }
}
exports.CiscoAdapter = CiscoAdapter;
//# sourceMappingURL=cisco.adapter.js.map