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
exports.HealthcheckService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const run_healthcheck_dto_1 = require("./dto/run-healthcheck.dto");
const healthcheck_engine_1 = require("./healthcheck.engine");
let HealthcheckService = class HealthcheckService {
    prisma;
    engine;
    aiService;
    constructor(prisma, engine, aiService) {
        this.prisma = prisma;
        this.engine = engine;
        this.aiService = aiService;
    }
    async run(payload) {
        const deviceRecord = await this.prisma.device.findUnique({
            where: { id: payload.deviceId },
        });
        if (!deviceRecord) {
            throw new common_1.NotFoundException(`Device with id ${payload.deviceId} not found`);
        }
        const device = {
            id: deviceRecord.id,
            name: deviceRecord.name,
            ip: deviceRecord.ip,
            type: deviceRecord.type,
            metadata: {
                credentialEncrypted: deviceRecord.credentialEncrypted,
            },
        };
        const checks = await this.engine.run(device, payload.mode ?? run_healthcheck_dto_1.ExecutionMode.Parallel);
        const overallStatus = this.determineOverallStatus(checks);
        const diagnosis = await this.aiService.analyze({ checks });
        const healthcheck = await this.prisma.healthcheckResult.create({
            data: {
                deviceId: payload.deviceId,
                status: overallStatus,
                details: { policy: payload.policy, checks, diagnosis },
            },
        });
        await this.prisma.checkResult.createMany({
            data: checks.map((check) => ({
                healthcheckId: healthcheck.id,
                step: check.checkName,
                status: check.status,
                output: JSON.stringify(check.metrics),
                responseTime: 0,
            })),
        });
        return { healthcheck: { ...healthcheck, details: healthcheck.details }, checks, diagnosis };
    }
    async findByDevice(deviceId) {
        const results = await this.prisma.healthcheckResult.findMany({
            where: { deviceId },
            include: { checks: true },
        });
        return results.map(result => ({ ...result, details: result.details }));
    }
    determineOverallStatus(checks) {
        if (checks.some((check) => check.status === 'CRITICAL')) {
            return 'CRITICAL';
        }
        if (checks.some((check) => check.status === 'WARNING')) {
            return 'WARNING';
        }
        return 'OK';
    }
};
exports.HealthcheckService = HealthcheckService;
exports.HealthcheckService = HealthcheckService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        healthcheck_engine_1.HealthcheckEngine,
        ai_service_1.AiService])
], HealthcheckService);
//# sourceMappingURL=healthcheck.service.js.map