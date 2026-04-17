"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SshService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshService = void 0;
const common_1 = require("@nestjs/common");
const node_ssh_1 = require("node-ssh");
const cisco_adapter_1 = require("./adapters/cisco.adapter");
let SshService = SshService_1 = class SshService {
    logger = new common_1.Logger(SshService_1.name);
    async connect(options) {
        const ssh = new node_ssh_1.NodeSSH();
        await ssh.connect({
            host: options.host,
            username: options.username,
            password: options.password,
            port: options.port ?? 22,
            readyTimeout: 20000,
        });
        return ssh;
    }
    async executeCommand(payload) {
        const ssh = await this.connect({
            host: payload.target,
            username: payload.username,
            password: payload.password,
            port: payload.port,
        });
        try {
            const command = payload.command ?? (payload.commandKey ? cisco_adapter_1.CiscoAdapter.getCommand(payload.commandKey) : '');
            this.logger.debug(`Executing SSH command on ${payload.target}: ${command}`);
            const result = await ssh.execCommand(command, { execOptions: { pty: true } });
            const parsed = payload.adapter === 'cisco'
                ? cisco_adapter_1.CiscoAdapter.parseOutput(payload.commandKey ?? command, result.stdout)
                : null;
            return {
                target: payload.target,
                command,
                stdout: result.stdout,
                stderr: result.stderr,
                parsed,
                executedAt: new Date(),
            };
        }
        finally {
            ssh.dispose();
        }
    }
};
exports.SshService = SshService;
exports.SshService = SshService = SshService_1 = __decorate([
    (0, common_1.Injectable)()
], SshService);
//# sourceMappingURL=ssh.service.js.map