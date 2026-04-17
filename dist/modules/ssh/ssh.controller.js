"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshController = void 0;
const common_1 = require("@nestjs/common");
const ssh_command_dto_1 = require("./dto/ssh-command.dto");
const ssh_service_1 = require("./ssh.service");
let SshController = class SshController {
    sshService;
    constructor(sshService) {
        this.sshService = sshService;
    }
    execute(payload) {
        return this.sshService.executeCommand(payload);
    }
};
exports.SshController = SshController;
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ssh_command_dto_1.SshCommandDto]),
    __metadata("design:returntype", void 0)
], SshController.prototype, "execute", null);
exports.SshController = SshController = __decorate([
    (0, common_1.Controller)('ssh'),
    __metadata("design:paramtypes", [ssh_service_1.SshService])
], SshController);
//# sourceMappingURL=ssh.controller.js.map