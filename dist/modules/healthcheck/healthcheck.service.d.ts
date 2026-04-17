import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RunHealthcheckDto } from './dto/run-healthcheck.dto';
import { Healthcheck } from './interfaces/healthcheck.interface';
import { HealthcheckEngine } from './healthcheck.engine';
import { CheckResult } from './interfaces/healthcheck-plugin.interface';
import { DiagnosisResult } from '../ai/interfaces/diagnosis.interface';
export declare class HealthcheckService {
    private readonly prisma;
    private readonly engine;
    private readonly aiService;
    constructor(prisma: PrismaService, engine: HealthcheckEngine, aiService: AiService);
    run(payload: RunHealthcheckDto): Promise<{
        healthcheck: Healthcheck;
        checks: CheckResult[];
        diagnosis: DiagnosisResult;
    }>;
    findByDevice(deviceId: number): Promise<Healthcheck[]>;
    private determineOverallStatus;
}
