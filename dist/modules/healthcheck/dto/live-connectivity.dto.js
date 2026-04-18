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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveConnectivityDto = exports.CliProtocol = void 0;
const class_validator_1 = require("class-validator");
var CliProtocol;
(function (CliProtocol) {
    CliProtocol["Ssh"] = "ssh";
    CliProtocol["Telnet"] = "telnet";
    CliProtocol["Serial"] = "serial";
})(CliProtocol || (exports.CliProtocol = CliProtocol = {}));
class LiveConnectivityDto {
    deviceId;
    ip;
    sshUsername;
    sshPassword;
    sshPort;
    sshAdapter;
    cliProtocol;
    telnetPort;
    serialPort;
    serialBaudRate;
    snmpCommunity;
    snmpVersion;
    snmpInterfaceIndex;
}
exports.LiveConnectivityDto = LiveConnectivityDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LiveConnectivityDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "ip", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "sshUsername", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "sshPassword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LiveConnectivityDto.prototype, "sshPort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "sshAdapter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CliProtocol),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "cliProtocol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LiveConnectivityDto.prototype, "telnetPort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "serialPort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1200),
    __metadata("design:type", Number)
], LiveConnectivityDto.prototype, "serialBaudRate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "snmpCommunity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LiveConnectivityDto.prototype, "snmpVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LiveConnectivityDto.prototype, "snmpInterfaceIndex", void 0);
//# sourceMappingURL=live-connectivity.dto.js.map