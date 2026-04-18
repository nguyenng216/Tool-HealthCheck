import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { AiService } from '../ai/ai.service';
import { SnmpService } from '../snmp/snmp.service';
import { SshService } from '../ssh/ssh.service';
import { TelnetService } from '../telnet/telnet.service';
import { RunHealthcheckDto, ExecutionMode } from './dto/run-healthcheck.dto';
import { CliProtocol, LiveConnectivityDto } from './dto/live-connectivity.dto';
import { Healthcheck } from './interfaces/healthcheck.interface';
import { HealthcheckEngine } from './healthcheck.engine';
import { CheckResult, Device } from './interfaces/healthcheck-plugin.interface';
import { DiagnosisResult } from '../ai/interfaces/diagnosis.interface';
import { createConnection } from 'net';

type LiveCredentialPayload = {
  cliProtocol?: CliProtocol;
  ssh?: {
    username: string;
    password: string;
    port?: number;
    adapter?: string;
  };
  telnet?: {
    port?: number;
  };
  serial?: {
    port: string;
    baudRate?: number;
  };
  snmp?: {
    community: string;
    version?: string;
    interfaceIndex?: number;
  };
};

const execFileAsync = promisify(execFile);

@Injectable()
export class HealthcheckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: HealthcheckEngine,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
    private readonly sshService: SshService,
    private readonly telnetService: TelnetService,
    private readonly snmpService: SnmpService,
    private readonly cryptoService: CryptoService,
  ) {}

  async run(
    payload: RunHealthcheckDto,
  ): Promise<{ healthcheck: Healthcheck; checks: CheckResult[]; diagnosis: DiagnosisResult }> {
    const deviceRecord = await this.prisma.device.findUnique({
      where: { id: payload.deviceId },
    });

    if (!deviceRecord) {
      throw new NotFoundException(`Device with id ${payload.deviceId} not found`);
    }

    const device: Device = {
      id: deviceRecord.id,
      name: deviceRecord.name,
      ip: deviceRecord.ip,
      type: deviceRecord.type,
      metadata: {
        credentialEncrypted: deviceRecord.credentialEncrypted,
      },
    };

    const mode = payload.mode ?? ExecutionMode.Parallel;
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
        } as any,
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

    return { healthcheck: { ...healthcheck, details: healthcheck.details as Record<string, unknown> }, checks, diagnosis };
  }

  async findByDevice(deviceId: number): Promise<Healthcheck[]> {
    const results = await this.prisma.healthcheckResult.findMany({
      where: { deviceId },
      include: { checks: true },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(result => ({ ...result, details: result.details as Record<string, unknown> }));
  }

  async testConnectivity(payload: LiveConnectivityDto): Promise<{
    deviceId: number;
    ssh: { ok: boolean; message: string };
    snmp: { ok: boolean; message: string };
  }> {
    const device = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
    if (!device) {
      throw new NotFoundException(`Device with id ${payload.deviceId} not found`);
    }

    const ip = payload.ip || device.ip;
    const ssh = await this.probeCli(ip, payload);
    const snmp = await this.probeSnmp(ip, payload);
    return { deviceId: payload.deviceId, ssh, snmp };
  }

  async runLive(payload: LiveConnectivityDto): Promise<{ healthcheck: Healthcheck; checks: CheckResult[]; diagnosis: DiagnosisResult }> {
    const deviceRecord = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
    if (!deviceRecord) {
      throw new NotFoundException(`Device with id ${payload.deviceId} not found`);
    }

    const device: Device = {
      id: deviceRecord.id,
      name: deviceRecord.name,
      ip: payload.ip || deviceRecord.ip,
      type: deviceRecord.type,
      metadata: {},
    };

    const credential = this.buildLiveCredential(payload);
    const checks = await this.runLiveChecks(device, credential, ExecutionMode.Parallel);
    const overallStatus = this.determineOverallStatus(checks);
    const diagnosis = await this.aiService.analyze({ checks });

    const healthcheck = await this.prisma.healthcheckResult.create({
      data: {
        deviceId: payload.deviceId,
        status: overallStatus,
        details: {
          policy: 'live-run',
          mode: ExecutionMode.Parallel,
          dataSource: 'live',
          cliProtocol: payload.cliProtocol ?? CliProtocol.Ssh,
          checks,
          diagnosis,
        } as any,
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
      healthcheck: { ...healthcheck, details: healthcheck.details as Record<string, unknown> },
      checks,
      diagnosis,
    };
  }

  async saveCredential(payload: LiveConnectivityDto): Promise<{ deviceId: number; saved: true }> {
    const device = await this.prisma.device.findUnique({ where: { id: payload.deviceId } });
    if (!device) {
      throw new NotFoundException(`Device with id ${payload.deviceId} not found`);
    }

    const credential = {
      cliProtocol: payload.cliProtocol ?? CliProtocol.Ssh,
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

  private buildLiveCredential(payload: LiveConnectivityDto): LiveCredentialPayload {
    return {
      cliProtocol: payload.cliProtocol ?? CliProtocol.Ssh,
      ssh: payload.sshUsername && payload.sshPassword ? {
        username: payload.sshUsername!,
        password: payload.sshPassword!,
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

  private determineOverallStatus(checks: CheckResult[]): string {
    if (checks.some((check) => check.status === 'CRITICAL')) {
      return 'CRITICAL';
    }

    if (checks.some((check) => check.status === 'WARNING')) {
      return 'WARNING';
    }

    return 'OK';
  }

  private async runLiveChecks(
    device: Device,
    credentialOrEncrypted: string | null | LiveCredentialPayload,
    mode: ExecutionMode,
  ): Promise<CheckResult[]> {
    const credential =
      typeof credentialOrEncrypted === 'string' || credentialOrEncrypted === null
        ? this.parseLiveCredential(credentialOrEncrypted)
        : credentialOrEncrypted;

    const taskList = [
      () => this.runLiveCpuCheck(device, credential),
      () => this.runLiveMemoryCheck(device, credential),
      () => this.runLiveInterfaceCheck(device, credential),
    ];

    if (mode === ExecutionMode.Sequence) {
      const results: CheckResult[] = [];
      for (const task of taskList) {
        results.push(await task());
      }
      return results;
    }

    return Promise.all(taskList.map((task) => task()));
  }

  private parseLiveCredential(credentialEncrypted: string | null): LiveCredentialPayload {
    if (!credentialEncrypted) {
      throw new BadRequestException(
        'Live mode requires device credential. Save JSON credential with ssh/snmp config before running healthcheck.',
      );
    }

    const decrypted = this.cryptoService.decrypt(credentialEncrypted);
    try {
      return JSON.parse(decrypted) as LiveCredentialPayload;
    } catch {
      throw new BadRequestException(
        'Device credential must be valid JSON: {"ssh":{"username":"...","password":"..."},"snmp":{"community":"..."}}',
      );
    }
  }

  private async runLiveCpuCheck(device: Device, credential: LiveCredentialPayload): Promise<CheckResult> {
    try {
      const text = await this.executeCliCommand(device, credential, 'show processes cpu | include CPU utilization');
      const value = this.extractFirstPercentage(text);
      const status = value === null ? 'WARNING' : value >= 90 ? 'CRITICAL' : value >= 70 ? 'WARNING' : 'OK';

      return {
        checkName: 'cpu',
        status,
        metrics: { cpuLoad: value, source: credential.cliProtocol ?? CliProtocol.Ssh, raw: text.slice(0, 300) },
        message:
          value === null
            ? 'Unable to parse CPU usage from CLI output; verify command support on device.'
            : `CPU load is ${value}% via ${String(credential.cliProtocol ?? CliProtocol.Ssh).toUpperCase()}.`,
      };
    } catch (error) {
      return this.failedCheck('cpu', 'CRITICAL', `CPU check failed: ${this.toErrorMessage(error)}`);
    }
  }

  private async runLiveMemoryCheck(device: Device, credential: LiveCredentialPayload): Promise<CheckResult> {
    try {
      const text = await this.executeCliCommand(device, credential, 'show processes memory | include Processor');
      const memoryUsed = this.extractUsedMemoryPercent(text);
      const status = memoryUsed === null ? 'WARNING' : memoryUsed >= 85 ? 'CRITICAL' : memoryUsed >= 70 ? 'WARNING' : 'OK';

      return {
        checkName: 'memory',
        status,
        metrics: { memoryUsedPercent: memoryUsed, source: credential.cliProtocol ?? CliProtocol.Ssh, raw: text.slice(0, 300) },
        message:
          memoryUsed === null
            ? 'Unable to parse memory usage from CLI output; verify command support on device.'
            : `Memory usage is ${memoryUsed}% via ${String(credential.cliProtocol ?? CliProtocol.Ssh).toUpperCase()}.`,
      };
    } catch (error) {
      return this.failedCheck('memory', 'CRITICAL', `Memory check failed: ${this.toErrorMessage(error)}`);
    }
  }

  private async runLiveInterfaceCheck(device: Device, credential: LiveCredentialPayload): Promise<CheckResult> {
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
    } catch (error) {
      return this.failedCheck('interface', 'CRITICAL', `SNMP interface check failed: ${this.toErrorMessage(error)}`);
    }
  }

  private failedCheck(checkName: string, status: 'WARNING' | 'CRITICAL', message: string): CheckResult {
    return {
      checkName,
      status,
      metrics: { source: 'live', error: message },
      message,
    };
  }

  private extractFirstPercentage(text: string): number | null {
    const match = text.match(/(\d{1,3}(?:\.\d+)?)%/);
    if (!match) {
      return null;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  private extractUsedMemoryPercent(text: string): number | null {
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

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private async probeCli(ip: string, payload: LiveConnectivityDto): Promise<{ ok: boolean; message: string }> {
    const protocol = payload.cliProtocol ?? CliProtocol.Ssh;
    try {
      if (protocol === CliProtocol.Telnet) {
        if (!payload.sshUsername || !payload.sshPassword) {
          return { ok: false, message: 'Telnet requires username and password.' };
        }
        await this.telnetService.executeCommand({
          host: ip,
          port: payload.telnetPort ?? 23,
          username: payload.sshUsername as string,
          password: payload.sshPassword as string,
          command: 'show version',
        });
        return { ok: true, message: 'Telnet connection successful.' };
      }

      if (protocol === CliProtocol.Serial) {
        if (!payload.serialPort) {
          return { ok: false, message: 'Serial protocol requires serialPort (example: COM3).' };
        }
        await this.execSerialWithPlink(payload.serialPort, payload.serialBaudRate ?? 9600, 'show version');
        return { ok: true, message: 'Serial connection successful via PuTTY plink.' };
      }

      // SSH
      if (!payload.sshUsername || !payload.sshPassword) {
        // Test port open only
        const port = payload.sshPort ?? 22;
        const ok = await this.testPortOpen(ip, port);
        return ok
          ? { ok: true, message: `SSH port ${port} is open on ${ip}.` }
          : { ok: false, message: `SSH port ${port} is not accessible on ${ip}.` };
      }

      await this.sshService.executeCommand({
        target: ip,
        username: payload.sshUsername as string,
        password: payload.sshPassword as string,
        port: payload.sshPort ?? 22,
        command: 'show version',
        adapter: payload.sshAdapter ?? 'cisco',
      });
      return { ok: true, message: 'SSH connection successful.' };
    } catch (error) {
      return { ok: false, message: `${protocol.toUpperCase()} failed: ${this.toErrorMessage(error)}` };
    }
  }

  private async probeSnmp(ip: string, payload: LiveConnectivityDto): Promise<{ ok: boolean; message: string }> {
    try {
      await this.snmpService.getInterfaceMetrics(ip, payload.snmpCommunity, payload.snmpInterfaceIndex ?? 1);
      return { ok: true, message: 'SNMP query successful.' };
    } catch (error) {
      return { ok: false, message: `SNMP failed: ${this.toErrorMessage(error)}` };
    }
  }

  private async executeCliCommand(device: Device, credential: LiveCredentialPayload, command: string): Promise<string> {
    const protocol = credential.cliProtocol ?? CliProtocol.Ssh;

    if (protocol === CliProtocol.Telnet) {
      if (!credential.ssh?.username || !credential.ssh?.password) {
        throw new BadRequestException('Telnet requires sshUsername and sshPassword fields.');
      }
      return this.telnetService.executeCommand({
        host: device.ip,
        port: credential.telnet?.port ?? 23,
        username: credential.ssh.username,
        password: credential.ssh.password,
        command,
      });
    }

    if (protocol === CliProtocol.Serial) {
      if (!credential.serial?.port) {
        throw new BadRequestException('Serial requires serialPort in saved credential.');
      }
      return this.execSerialWithPlink(credential.serial.port, credential.serial.baudRate ?? 9600, command);
    }

    if (!credential.ssh) {
      throw new BadRequestException('SSH credential is missing.');
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

  private async execSerialWithPlink(serialPort: string, baudRate: number, command: string): Promise<string> {
    const plinkPath = this.configService.get<string>('puttyPlinkPath') || 'plink';
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

  private async testPortOpen(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = createConnection(port, host);
      socket.setTimeout(5000); // 5 second timeout

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
}
