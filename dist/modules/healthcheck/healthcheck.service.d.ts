import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { AiService } from '../ai/ai.service';
import { SnmpService } from '../snmp/snmp.service';
import { SshService } from '../ssh/ssh.service';
import { TelnetService } from '../telnet/telnet.service';
import { RunHealthcheckDto } from './dto/run-healthcheck.dto';
import { LiveConnectivityDto } from './dto/live-connectivity.dto';
import { Healthcheck } from './interfaces/healthcheck.interface';
import { HealthcheckEngine } from './healthcheck.engine';
import { CheckResult } from './interfaces/healthcheck-plugin.interface';
import { DiagnosisResult } from '../ai/interfaces/diagnosis.interface';
export declare class HealthcheckService {
    private readonly prisma;
    private readonly engine;
    private readonly aiService;
    private readonly configService;
    private readonly sshService;
    private readonly telnetService;
    private readonly snmpService;
    private readonly cryptoService;
    constructor(prisma: PrismaService, engine: HealthcheckEngine, aiService: AiService, configService: ConfigService, sshService: SshService, telnetService: TelnetService, snmpService: SnmpService, cryptoService: CryptoService);
    run(payload: RunHealthcheckDto): Promise<{
        healthcheck: Healthcheck;
        checks: CheckResult[];
        diagnosis: DiagnosisResult;
    }>;
    findByDevice(deviceId: number): Promise<Healthcheck[]>;
    testConnectivity(payload: LiveConnectivityDto): Promise<{
        deviceId: number;
        ssh: {
            ok: boolean;
            message: string;
        };
        snmp: {
            ok: boolean;
            message: string;
        };
    }>;
    runLive(payload: LiveConnectivityDto): Promise<{
        healthcheck: Healthcheck;
        checks: CheckResult[];
        diagnosis: DiagnosisResult;
    }>;
    saveCredential(payload: LiveConnectivityDto): Promise<{
        deviceId: number;
        saved: true;
    }>;
    private buildLiveCredential;
    private determineOverallStatus;
    private runLiveChecks;
    private parseLiveCredential;
    private runLiveCpuCheck;
    private runLiveMemoryCheck;
    private runLiveInterfaceCheck;
    private failedCheck;
    private extractFirstPercentage;
    private extractUsedMemoryPercent;
    private toErrorMessage;
    private probeCli;
    private probeSnmp;
    private executeCliCommand;
    private execSerialWithPlink;
    private testPortOpen;
}
