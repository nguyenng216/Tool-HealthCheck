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
exports.HealthcheckController = void 0;
const common_1 = require("@nestjs/common");
const run_healthcheck_dto_1 = require("./dto/run-healthcheck.dto");
const live_connectivity_dto_1 = require("./dto/live-connectivity.dto");
const healthcheck_service_1 = require("./healthcheck.service");
let HealthcheckController = class HealthcheckController {
    healthcheckService;
    constructor(healthcheckService) {
        this.healthcheckService = healthcheckService;
    }
    run(payload) {
        return this.healthcheckService.run(payload);
    }
    testConnectivity(payload) {
        return this.healthcheckService.testConnectivity(payload);
    }
    runLive(payload) {
        return this.healthcheckService.runLive(payload);
    }
    saveCredential(payload) {
        return this.healthcheckService.saveCredential(payload);
    }
    findByDevice(deviceId) {
        return this.healthcheckService.findByDevice(Number(deviceId));
    }
};
exports.HealthcheckController = HealthcheckController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [run_healthcheck_dto_1.RunHealthcheckDto]),
    __metadata("design:returntype", void 0)
], HealthcheckController.prototype, "run", null);
__decorate([
    (0, common_1.Post)('connectivity-test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [live_connectivity_dto_1.LiveConnectivityDto]),
    __metadata("design:returntype", void 0)
], HealthcheckController.prototype, "testConnectivity", null);
__decorate([
    (0, common_1.Post)('live-run'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [live_connectivity_dto_1.LiveConnectivityDto]),
    __metadata("design:returntype", void 0)
], HealthcheckController.prototype, "runLive", null);
__decorate([
    (0, common_1.Post)('device-credential'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [live_connectivity_dto_1.LiveConnectivityDto]),
    __metadata("design:returntype", void 0)
], HealthcheckController.prototype, "saveCredential", null);
__decorate([
    (0, common_1.Get)(':deviceId'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthcheckController.prototype, "findByDevice", null);
exports.HealthcheckController = HealthcheckController = __decorate([
    (0, common_1.Controller)('healthchecks'),
    __metadata("design:paramtypes", [healthcheck_service_1.HealthcheckService])
], HealthcheckController);
//# sourceMappingURL=healthcheck.controller.js.map