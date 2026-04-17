import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RunHealthcheckDto, ExecutionMode } from './dto/run-healthcheck.dto';
import { Healthcheck } from './interfaces/healthcheck.interface';
import { HealthcheckEngine } from './healthcheck.engine';
import { CheckResult, Device } from './interfaces/healthcheck-plugin.interface';
import { DiagnosisResult } from '../ai/interfaces/diagnosis.interface';

@Injectable()
export class HealthcheckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: HealthcheckEngine,
    private readonly aiService: AiService,
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

    const checks = await this.engine.run(device, payload.mode ?? ExecutionMode.Parallel);
    const overallStatus = this.determineOverallStatus(checks);

    const diagnosis = await this.aiService.analyze({ checks });

    const healthcheck = await this.prisma.healthcheckResult.create({
      data: {
        deviceId: payload.deviceId,
        status: overallStatus,
        details: { policy: payload.policy, checks, diagnosis } as any,
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
    });
    return results.map(result => ({ ...result, details: result.details as Record<string, unknown> }));
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
}
