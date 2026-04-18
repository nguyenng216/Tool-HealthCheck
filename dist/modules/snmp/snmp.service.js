"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var SnmpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnmpService = void 0;
const common_1 = require("@nestjs/common");
const snmp = __importStar(require("net-snmp"));
let SnmpService = SnmpService_1 = class SnmpService {
    logger = new common_1.Logger(SnmpService_1.name);
    async get(payload) {
        this.logger.debug(`SNMP GET: target=${payload.target}, oid=${payload.oid}`);
        return new Promise((resolve, reject) => {
            const session = snmp.createSession(payload.target, payload.community || 'public', {
                version: snmp.Version2c,
                timeout: 5000,
            });
            session.get([payload.oid], (error, varbinds) => {
                session.close();
                if (error) {
                    this.logger.error(`SNMP GET error: ${error.message}`);
                    reject(new Error(`SNMP GET failed: ${error.message}`));
                    return;
                }
                if (!varbinds || varbinds.length === 0) {
                    reject(new Error('No SNMP response received'));
                    return;
                }
                const results = {};
                for (const varbind of varbinds) {
                    if (snmp.isVarbindError(varbind)) {
                        this.logger.error(`SNMP varbind error: ${snmp.varbindError(varbind)}`);
                        continue;
                    }
                    results[varbind.oid] = varbind.value;
                }
                resolve({
                    target: payload.target,
                    oid: payload.oid,
                    type: 'get',
                    results,
                    queriedAt: new Date(),
                });
            });
        });
    }
    async query(payload) {
        const isSpecificOid = /\.\d+$/.test(payload.oid);
        return isSpecificOid ? this.get(payload) : this.walk(payload);
    }
    async walk(payload) {
        this.logger.debug(`SNMP WALK: target=${payload.target}, oid=${payload.oid}`);
        return new Promise((resolve, reject) => {
            const session = snmp.createSession(payload.target, payload.community || 'public', {
                version: snmp.Version2c,
                timeout: 5000,
            });
            const results = {};
            session.walk(payload.oid, 10, (varbinds) => {
                for (const varbind of varbinds) {
                    if (snmp.isVarbindError(varbind)) {
                        this.logger.error(`SNMP walk varbind error: ${snmp.varbindError(varbind)}`);
                        continue;
                    }
                    results[varbind.oid] = varbind.value;
                }
            }, (error) => {
                session.close();
                if (error) {
                    this.logger.error(`SNMP WALK error: ${error.message}`);
                    reject(new Error(`SNMP WALK failed: ${error.message}`));
                    return;
                }
                resolve({
                    target: payload.target,
                    oid: payload.oid,
                    type: 'walk',
                    results,
                    queriedAt: new Date(),
                });
            });
        });
    }
    async getInterfaceMetrics(target, community, interfaceIndex) {
        this.logger.debug(`SNMP interface metrics: target=${target}, interface=${interfaceIndex}`);
        return new Promise((resolve, reject) => {
            const session = snmp.createSession(target, community, {
                version: snmp.Version2c,
                timeout: 5000,
            });
            const oids = [
                `1.3.6.1.2.1.2.2.1.2.${interfaceIndex}`,
                `1.3.6.1.2.1.2.2.1.7.${interfaceIndex}`,
                `1.3.6.1.2.1.2.2.1.8.${interfaceIndex}`,
                `1.3.6.1.2.1.2.2.1.10.${interfaceIndex}`,
                `1.3.6.1.2.1.2.2.1.16.${interfaceIndex}`,
            ];
            session.get(oids, (error, varbinds) => {
                session.close();
                if (error) {
                    this.logger.error(`SNMP interface metrics error: ${error.message}`);
                    reject(new Error(`SNMP interface metrics failed: ${error.message}`));
                    return;
                }
                if (!varbinds || varbinds.length < 5) {
                    reject(new Error('Incomplete SNMP interface response'));
                    return;
                }
                const results = {};
                const oidNames = ['description', 'adminStatus', 'operStatus', 'inOctets', 'outOctets'];
                for (let i = 0; i < varbinds.length; i++) {
                    const varbind = varbinds[i];
                    if (snmp.isVarbindError(varbind)) {
                        this.logger.error(`SNMP interface varbind error: ${snmp.varbindError(varbind)}`);
                        continue;
                    }
                    let value = varbind.value;
                    if (oidNames[i] === 'adminStatus' || oidNames[i] === 'operStatus') {
                        value = value === 1 ? 'up' : value === 2 ? 'down' : 'testing';
                    }
                    results[oidNames[i]] = value;
                }
                resolve({
                    target,
                    oid: `interfaceMetrics:${interfaceIndex}`,
                    type: 'interfaceMetrics',
                    results,
                    queriedAt: new Date(),
                });
            });
        });
    }
};
exports.SnmpService = SnmpService;
exports.SnmpService = SnmpService = SnmpService_1 = __decorate([
    (0, common_1.Injectable)()
], SnmpService);
//# sourceMappingURL=snmp.service.js.map