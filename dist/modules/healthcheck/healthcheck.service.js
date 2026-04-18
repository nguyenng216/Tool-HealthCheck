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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_service_1 = require("../../common/crypto/crypto.service");
const util_1 = require("util");
const child_process_1 = require("child_process");
const ai_service_1 = require("../ai/ai.service");
const snmp_service_1 = require("../snmp/snmp.service");
const ssh_service_1 = require("../ssh/ssh.service");
const telnet_service_1 = require("../telnet/telnet.service");
const run_healthcheck_dto_1 = require("./dto/run-healthcheck.dto");
const live_connectivity_dto_1 = require("./dto/live-connectivity.dto");
const healthcheck_engine_1 = require("./healthcheck.engine");
const net_1 = require("net");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let HealthcheckService = class HealthcheckService {
    prisma;
    engine;
    aiService;
    configService;
    sshService;
    telnetService;
    snmpService;
    cryptoService;
    constructor(prisma, engine, aiService, configService, sshService, telnetService, snmpService, cryptoService) {
        this.prisma = prisma;
        this.engine = engine;
        this.aiService = aiService;
        this.configService = configService;
        this.sshService = sshService;
        this.telnetService = telnetService;
        this.snmpService = snmpService;
        this.cryptoService = cryptoService;
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
        const mode = payload.mode ?? run_healthcheck_dto_1.ExecutionMode.Parallel;
        const checks = await this.runLiveChecks(device, deviceRecord.credentialEncrypted, mode);
        const overallStatus = this.determineOverallStatus(checks);
        const diagnosis = await this.aiService.analyze({ checks });
        const healthcheck = await this.prisma.healthcheckResult.create({
            data: {
                deviceId: payload.deviceId,
                status: overallStatus,
                details: {
                    policy: payload.policy,
                    mode,
                    checks,
                    diagnosis,
                },
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
            orderBy: { createdAt: 'desc' },
        });
        return results.map(result => ({ ...result, details: result.details }));
    }
    async testConnectivity(payload) {
        const device = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
        if (!device) {
            throw new common_1.NotFoundException(`Device with id ${payload.deviceId} not found`);
        }
        const ip = payload.ip || device.ip;
        const ssh = await this.probeCli(ip, payload);
        const snmp = await this.probeSnmp(ip, payload);
        return { deviceId: payload.deviceId, ssh, snmp };
    }
    async runLive(payload) {
        const deviceRecord = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
        if (!deviceRecord) {
            throw new common_1.NotFoundException(`Device with id ${payload.deviceId} not found`);
        }
        const device = {
            id: deviceRecord.id,
            name: deviceRecord.name,
            ip: payload.ip || deviceRecord.ip,
            type: deviceRecord.type,
            metadata: {},
        };
        const credential = this.buildLiveCredential(payload);
        const checks = await this.runLiveChecks(device, credential, run_healthcheck_dto_1.ExecutionMode.Parallel);
        const overallStatus = this.determineOverallStatus(checks);
        const diagnosis = await this.aiService.analyze({ checks });
        const healthcheck = await this.prisma.healthcheckResult.create({
            data: {
                deviceId: payload.deviceId,
                status: overallStatus,
                details: {
                    policy: 'live-run',
                    mode: run_healthcheck_dto_1.ExecutionMode.Parallel,
                    dataSource: 'live',
                    cliProtocol: payload.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh,
                    checks,
                    diagnosis,
                },
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
        return {
            healthcheck: { ...healthcheck, details: healthcheck.details },
            checks,
            diagnosis,
        };
    }
    async saveCredential(payload) {
        const device = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
        if (!device) {
            throw new common_1.NotFoundException(`Device with id ${payload.deviceId} not found`);
        }
        const credential = {
            cliProtocol: payload.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh,
            ssh: {
                username: payload.sshUsername,
                password: payload.sshPassword,
                port: payload.sshPort ?? 22,
                adapter: payload.sshAdapter ?? 'cisco',
            },
            telnet: {
                port: payload.telnetPort ?? 23,
            },
            serial: payload.serialPort
                ? {
                    port: payload.serialPort,
                    baudRate: payload.serialBaudRate ?? 9600,
                }
                : undefined,
            snmp: {
                community: payload.snmpCommunity,
                version: payload.snmpVersion ?? '2c',
                interfaceIndex: payload.snmpInterfaceIndex ?? 1,
            },
        };
        await this.prisma.device.update({
            where: { id: payload.deviceId },
            data: {
                credentialEncrypted: this.cryptoService.encrypt(JSON.stringify(credential)),
            },
        });
        return { deviceId: payload.deviceId, saved: true };
    }
    buildLiveCredential(payload) {
        return {
            cliProtocol: payload.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh,
            ssh: payload.sshUsername && payload.sshPassword ? {
                username: payload.sshUsername,
                password: payload.sshPassword,
                port: payload.sshPort ?? 22,
                adapter: payload.sshAdapter ?? 'cisco',
            } : undefined,
            telnet: {
                port: payload.telnetPort ?? 23,
            },
            serial: payload.serialPort
                ? {
                    port: payload.serialPort,
                    baudRate: payload.serialBaudRate ?? 9600,
                }
                : undefined,
            snmp: {
                community: payload.snmpCommunity,
                version: payload.snmpVersion ?? '2c',
                interfaceIndex: payload.snmpInterfaceIndex ?? 1,
            },
        };
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
    async runLiveChecks(device, credentialOrEncrypted, mode) {
        const credential = typeof credentialOrEncrypted === 'string' || credentialOrEncrypted === null
            ? this.parseLiveCredential(credentialOrEncrypted)
            : credentialOrEncrypted;
        const taskList = [
            () => this.runLiveCpuCheck(device, credential),
            () => this.runLiveMemoryCheck(device, credential),
            () => this.runLiveInterfaceCheck(device, credential),
        ];
        if (mode === run_healthcheck_dto_1.ExecutionMode.Sequence) {
            const results = [];
            for (const task of taskList) {
                results.push(await task());
            }
            return results;
        }
        return Promise.all(taskList.map((task) => task()));
    }
    parseLiveCredential(credentialEncrypted) {
        if (!credentialEncrypted) {
            throw new common_1.BadRequestException('Live mode requires device credential. Save JSON credential with ssh/snmp config before running healthcheck.');
        }
        const decrypted = this.cryptoService.decrypt(credentialEncrypted);
        try {
            return JSON.parse(decrypted);
        }
        catch {
            throw new common_1.BadRequestException('Device credential must be valid JSON: {"ssh":{"username":"...","password":"..."},"snmp":{"community":"..."}}');
        }
    }
    async runLiveCpuCheck(device, credential) {
        try {
            const text = await this.executeCliCommand(device, credential, 'show processes cpu | include CPU utilization');
            const value = this.extractFirstPercentage(text);
            const status = value === null ? 'WARNING' : value >= 90 ? 'CRITICAL' : value >= 70 ? 'WARNING' : 'OK';
            return {
                checkName: 'cpu',
                status,
                metrics: { cpuLoad: value, source: credential.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh, raw: text.slice(0, 300) },
                message: value === null
                    ? 'Unable to parse CPU usage from CLI output; verify command support on device.'
                    : `CPU load is ${value}% via ${String(credential.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh).toUpperCase()}.`,
            };
        }
        catch (error) {
            return this.failedCheck('cpu', 'CRITICAL', `CPU check failed: ${this.toErrorMessage(error)}`);
        }
    }
    async runLiveMemoryCheck(device, credential) {
        try {
            const text = await this.executeCliCommand(device, credential, 'show processes memory | include Processor');
            const memoryUsed = this.extractUsedMemoryPercent(text);
            const status = memoryUsed === null ? 'WARNING' : memoryUsed >= 85 ? 'CRITICAL' : memoryUsed >= 70 ? 'WARNING' : 'OK';
            return {
                checkName: 'memory',
                status,
                metrics: { memoryUsedPercent: memoryUsed, source: credential.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh, raw: text.slice(0, 300) },
                message: memoryUsed === null
                    ? 'Unable to parse memory usage from CLI output; verify command support on device.'
                    : `Memory usage is ${memoryUsed}% via ${String(credential.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh).toUpperCase()}.`,
            };
        }
        catch (error) {
            return this.failedCheck('memory', 'CRITICAL', `Memory check failed: ${this.toErrorMessage(error)}`);
        }
    }
    async runLiveInterfaceCheck(device, credential) {
        if (!credential.snmp?.community) {
            return this.failedCheck('interface', 'WARNING', 'Missing snmp credential for interface check');
        }
        const interfaceIndex = credential.snmp.interfaceIndex ?? 1;
        try {
            const result = await this.snmpService.getInterfaceMetrics(device.ip, credential.snmp.community, interfaceIndex);
            const admin = String(result.results.adminStatus ?? '').toLowerCase();
            const oper = String(result.results.operStatus ?? '').toLowerCase();
            const interfaceUp = admin === 'up' && oper === 'up';
            return {
                checkName: 'interface',
                status: interfaceUp ? 'OK' : 'CRITICAL',
                metrics: {
                    interfaceUp,
                    adminStatus: result.results.adminStatus,
                    operStatus: result.results.operStatus,
                    source: 'snmp',
                    interfaceIndex,
                },
                message: interfaceUp ? 'Interface operational via SNMP.' : 'Interface status is down via SNMP.',
            };
        }
        catch (error) {
            return this.failedCheck('interface', 'CRITICAL', `SNMP interface check failed: ${this.toErrorMessage(error)}`);
        }
    }
    failedCheck(checkName, status, message) {
        return {
            checkName,
            status,
            metrics: { source: 'live', error: message },
            message,
        };
    }
    extractFirstPercentage(text) {
        const match = text.match(/(\d{1,3}(?:\.\d+)?)%/);
        if (!match) {
            return null;
        }
        const value = Number(match[1]);
        return Number.isFinite(value) ? value : null;
    }
    extractUsedMemoryPercent(text) {
        const numbers = text.match(/\d+/g);
        if (!numbers || numbers.length < 2) {
            return this.extractFirstPercentage(text);
        }
        const used = Number(numbers[0]);
        const free = Number(numbers[1]);
        if (!Number.isFinite(used) || !Number.isFinite(free) || used + free === 0) {
            return null;
        }
        return Math.round((used / (used + free)) * 100);
    }
    toErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
    async probeCli(ip, payload) {
        const protocol = payload.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh;
        try {
            if (protocol === live_connectivity_dto_1.CliProtocol.Telnet) {
                if (!payload.sshUsername || !payload.sshPassword) {
                    return { ok: false, message: 'Telnet requires username and password.' };
                }
                await this.telnetService.executeCommand({
                    host: ip,
                    port: payload.telnetPort ?? 23,
                    username: payload.sshUsername,
                    password: payload.sshPassword,
                    command: 'show version',
                });
                return { ok: true, message: 'Telnet connection successful.' };
            }
            if (protocol === live_connectivity_dto_1.CliProtocol.Serial) {
                if (!payload.serialPort) {
                    return { ok: false, message: 'Serial protocol requires serialPort (example: COM3).' };
                }
                await this.execSerialWithPlink(payload.serialPort, payload.serialBaudRate ?? 9600, 'show version');
                return { ok: true, message: 'Serial connection successful via PuTTY plink.' };
            }
            if (!payload.sshUsername || !payload.sshPassword) {
                const port = payload.sshPort ?? 22;
                const ok = await this.testPortOpen(ip, port);
                return ok
                    ? { ok: true, message: `SSH port ${port} is open on ${ip}.` }
                    : { ok: false, message: `SSH port ${port} is not accessible on ${ip}.` };
            }
            await this.sshService.executeCommand({
                target: ip,
                username: payload.sshUsername,
                password: payload.sshPassword,
                port: payload.sshPort ?? 22,
                command: 'show version',
                adapter: payload.sshAdapter ?? 'cisco',
            });
            return { ok: true, message: 'SSH connection successful.' };
        }
        catch (error) {
            return { ok: false, message: `${protocol.toUpperCase()} failed: ${this.toErrorMessage(error)}` };
        }
    }
    async probeSnmp(ip, payload) {
        try {
            await this.snmpService.getInterfaceMetrics(ip, payload.snmpCommunity, payload.snmpInterfaceIndex ?? 1);
            return { ok: true, message: 'SNMP query successful.' };
        }
        catch (error) {
            return { ok: false, message: `SNMP failed: ${this.toErrorMessage(error)}` };
        }
    }
    async executeCliCommand(device, credential, command) {
        const protocol = credential.cliProtocol ?? live_connectivity_dto_1.CliProtocol.Ssh;
        if (protocol === live_connectivity_dto_1.CliProtocol.Telnet) {
            if (!credential.ssh?.username || !credential.ssh?.password) {
                throw new common_1.BadRequestException('Telnet requires sshUsername and sshPassword fields.');
            }
            return this.telnetService.executeCommand({
                host: device.ip,
                port: credential.telnet?.port ?? 23,
                username: credential.ssh.username,
                password: credential.ssh.password,
                command,
            });
        }
        if (protocol === live_connectivity_dto_1.CliProtocol.Serial) {
            if (!credential.serial?.port) {
                throw new common_1.BadRequestException('Serial requires serialPort in saved credential.');
            }
            return this.execSerialWithPlink(credential.serial.port, credential.serial.baudRate ?? 9600, command);
        }
        if (!credential.ssh) {
            throw new common_1.BadRequestException('SSH credential is missing.');
        }
        const sshResult = await this.sshService.executeCommand({
            target: device.ip,
            username: credential.ssh.username,
            password: credential.ssh.password,
            port: credential.ssh.port,
            command,
            adapter: credential.ssh.adapter ?? 'cisco',
        });
        return sshResult.stdout || '';
    }
    async execSerialWithPlink(serialPort, baudRate, command) {
        const plinkPath = this.configService.get('puttyPlinkPath') || 'plink';
        const { stdout, stderr } = await execFileAsync(plinkPath, [
            '-serial',
            serialPort,
            '-sercfg',
            `${baudRate},8,n,1,N`,
            '-batch',
            command,
        ]);
        if (stderr && stderr.trim().length > 0) {
            throw new Error(stderr.trim());
        }
        return stdout?.toString() ?? '';
    }
    async testPortOpen(host, port) {
        return new Promise((resolve) => {
            const socket = (0, net_1.createConnection)(port, host);
            socket.setTimeout(5000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                resolve(false);
            });
        });
    }
};
exports.HealthcheckService = HealthcheckService;
exports.HealthcheckService = HealthcheckService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        healthcheck_engine_1.HealthcheckEngine,
        ai_service_1.AiService,
        config_1.ConfigService,
        ssh_service_1.SshService,
        telnet_service_1.TelnetService,
        snmp_service_1.SnmpService,
        crypto_service_1.CryptoService])
], HealthcheckService);
//# sourceMappingURL=healthcheck.service.js.map