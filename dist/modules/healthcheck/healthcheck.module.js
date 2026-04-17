"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcheckModule = void 0;
const common_1 = require("@nestjs/common");
const ai_module_1 = require("../ai/ai.module");
const healthcheck_controller_1 = require("./healthcheck.controller");
const healthcheck_service_1 = require("./healthcheck.service");
const healthcheck_engine_1 = require("./healthcheck.engine");
let HealthcheckModule = class HealthcheckModule {
};
exports.HealthcheckModule = HealthcheckModule;
exports.HealthcheckModule = HealthcheckModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule],
        controllers: [healthcheck_controller_1.HealthcheckController],
        providers: [healthcheck_service_1.HealthcheckService, healthcheck_engine_1.HealthcheckEngine],
        exports: [healthcheck_service_1.HealthcheckService],
    })
], HealthcheckModule);
//# sourceMappingURL=healthcheck.module.js.map