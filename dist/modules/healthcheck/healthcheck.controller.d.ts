import { RunHealthcheckDto } from './dto/run-healthcheck.dto';
import { LiveConnectivityDto } from './dto/live-connectivity.dto';
import { HealthcheckService } from './healthcheck.service';
export declare class HealthcheckController {
    private readonly healthcheckService;
    constructor(healthcheckService: HealthcheckService);
    run(payload: RunHealthcheckDto): Promise<{
        healthcheck: import("./interfaces/healthcheck.interface").Healthcheck;
        checks: import("./interfaces/healthcheck-plugin.interface").CheckResult[];
        diagnosis: import("../ai/interfaces/diagnosis.interface").DiagnosisResult;
    }>;
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
        healthcheck: import("./interfaces/healthcheck.interface").Healthcheck;
        checks: import("./interfaces/healthcheck-plugin.interface").CheckResult[];
        diagnosis: import("../ai/interfaces/diagnosis.interface").DiagnosisResult;
    }>;
    saveCredential(payload: LiveConnectivityDto): Promise<{
        deviceId: number;
        saved: true;
    }>;
    findByDevice(deviceId: string): Promise<import("./interfaces/healthcheck.interface").Healthcheck[]>;
}
