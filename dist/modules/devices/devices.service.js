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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_service_1 = require("../../common/crypto/crypto.service");
let DevicesService = class DevicesService {
    prisma;
    cryptoService;
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    async create(payload) {
        const credentialEncrypted = payload.credential
            ? this.cryptoService.encrypt(payload.credential)
            : null;
        return this.prisma.device.create({
            data: {
                name: payload.name,
                ip: payload.ip,
                type: payload.type,
                credentialEncrypted,
            },
        });
    }
    async findAll() {
        return this.prisma.device.findMany();
    }
    async findOne(id) {
        const device = await this.prisma.device.findUnique({ where: { id } });
        if (!device) {
            throw new common_1.NotFoundException(`Device ${id} not found`);
        }
        return device;
    }
    async update(id, payload) {
        const device = await this.findOne(id);
        const credentialEncrypted = payload.credential
            ? this.cryptoService.encrypt(payload.credential)
            : device.credentialEncrypted;
        return this.prisma.device.update({
            where: { id },
            data: {
                name: payload.name ?? device.name,
                ip: payload.ip ?? device.ip,
                type: payload.type ?? device.type,
                credentialEncrypted,
            },
        });
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map