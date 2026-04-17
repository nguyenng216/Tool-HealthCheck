import { RunHealthcheckDto } from './dto/run-healthcheck.dto';
import { HealthcheckService } from './healthcheck.service';
export declare class HealthcheckController {
    private readonly healthcheckService;
    constructor(healthcheckService: HealthcheckService);
    run(payload: RunHealthcheckDto): Promise<{
        healthcheck: import("./interfaces/healthcheck.interface").Healthcheck;
        checks: import("./interfaces/healthcheck-plugin.interface").CheckResult[];
        diagnosis: import("../ai/interfaces/diagnosis.interface").DiagnosisResult;
    }>;
    findByDevice(deviceId: string): Promise<import("./interfaces/healthcheck.interface").Healthcheck[]>;
}
