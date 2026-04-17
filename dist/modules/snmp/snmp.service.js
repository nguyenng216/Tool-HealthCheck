"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SnmpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnmpService = void 0;
const common_1 = require("@nestjs/common");
let SnmpService = SnmpService_1 = class SnmpService {
    logger = new common_1.Logger(SnmpService_1.name);
    async get(payload) {
        this.logger.debug(`SNMP GET: target=${payload.target}, oid=${payload.oid}`);
        return {
            target: payload.target,
            oid: payload.oid,
            type: 'get',
            results: { [payload.oid]: 'mock-value' },
            queriedAt: new Date(),
        };
    }
    async query(payload) {
        const isSpecificOid = /\.\d+$/.test(payload.oid);
        return isSpecificOid ? this.get(payload) : this.walk(payload);
    }
    async getInterfaceMetrics(target, community, interfaceIndex) {
        this.logger.debug(`SNMP interface metrics: target=${target}, interface=${interfaceIndex}`);
        return {
            target,
            oid: `interfaceMetrics:${interfaceIndex}`,
            type: 'interfaceMetrics',
            results: {
                description: 'GigabitEthernet0/0/1',
                adminStatus: 'up',
                operStatus: 'up',
                inOctets: 1000000,
                outOctets: 500000,
            },
            queriedAt: new Date(),
        };
    }
};
exports.SnmpService = SnmpService;
exports.SnmpService = SnmpService = SnmpService_1 = __decorate([
    (0, common_1.Injectable)()
], SnmpService);
//# sourceMappingURL=snmp.service.js.map