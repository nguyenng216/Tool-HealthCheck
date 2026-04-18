"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelnetService = void 0;
const common_1 = require("@nestjs/common");
const telnet_client_1 = require("telnet-client");
let TelnetService = class TelnetService {
    async executeCommand(options) {
        const connection = new telnet_client_1.Telnet();
        try {
            await connection.connect({
                host: options.host,
                port: options.port ?? 23,
                shellPrompt: options.shellPrompt ?? /[#>$]\s?$/,
                timeout: options.timeoutMs ?? 20000,
                username: options.username,
                password: options.password,
                negotiationMandatory: false,
                ors: '\n',
            });
            const output = await connection.exec(options.command, {
                shellPrompt: options.shellPrompt ?? /[#>$]\s?$/,
                timeout: options.timeoutMs ?? 20000,
            });
            return String(output ?? '');
        }
        finally {
            connection.end();
        }
    }
};
exports.TelnetService = TelnetService;
exports.TelnetService = TelnetService = __decorate([
    (0, common_1.Injectable)()
], TelnetService);
//# sourceMappingURL=telnet.service.js.map