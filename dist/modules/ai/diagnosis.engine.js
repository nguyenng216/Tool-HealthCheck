"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DiagnosisEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisEngine = void 0;
const common_1 = require("@nestjs/common");
let DiagnosisEngine = DiagnosisEngine_1 = class DiagnosisEngine {
    logger = new common_1.Logger(DiagnosisEngine_1.name);
    rules = [
        {
            issue: 'Interface speed mismatch with CRC errors',
            severity: 'CRITICAL',
            rootCause: 'A mismatch between negotiated interface speed and expected speed is causing frame drops and CRC error accumulation.',
            recommendation: 'Validate interface speed/duplex on both ends, reconcile configuration, and replace cabling if CRC counters remain high.',
            score: 100,
            matches: (signals) => signals.speedMismatch && (signals.crcErrors ?? 0) > 0,
        },
        {
            issue: 'VLAN isolation failure causing traffic segregation issues',
            severity: 'HIGH',
            rootCause: 'VLAN boundaries are not enforced correctly, which can result in unintended traffic leakage or loss of isolated segments.',
            recommendation: 'Review VLAN membership, trunk configuration, and ACLs to restore proper isolation and path segmentation.',
            score: 90,
            matches: (signals) => signals.vlanIsolation === true,
        },
        {
            issue: 'DNS slow response impacting service resolution',
            severity: 'HIGH',
            rootCause: 'DNS lookups are delayed beyond acceptable thresholds, which slows application and network convergence.',
            recommendation: 'Check upstream resolver health, network latency to DNS servers, and caching behavior on the local resolver.',
            score: 85,
            matches: (signals) => signals.dnsSlow || signals.dnsFailures,
        },
        {
            issue: 'Low traffic with high CPU indicates an anomaly',
            severity: 'MEDIUM',
            rootCause: 'CPU utilization is high despite low forwarding traffic, suggesting a control-plane or polling storm issue.',
            recommendation: 'Inspect process utilization, monitoring polling intervals, and control-plane events for abnormal CPU consumption.',
            score: 80,
            matches: (signals) => signals.highCpu && signals.lowTraffic,
        },
        {
            issue: 'High traffic driving expected CPU load',
            severity: 'LOW',
            rootCause: 'CPU utilization is elevated because the device is forwarding a large amount of traffic, which is expected under load.',
            recommendation: 'Monitor capacity growth and consider scaling or QoS if sustained traffic remains high.',
            score: 60,
            matches: (signals) => signals.highCpu && signals.highTraffic,
        },
        {
            issue: 'CRC errors are increasing on the interface',
            severity: 'MEDIUM',
            rootCause: 'Frame integrity failures are rising, often due to physical media issues, duplex mismatch, or bad transceivers.',
            recommendation: 'Run cable diagnostics, verify interface statistics, and replace faulty optics or cable pairs.',
            score: 70,
            matches: (signals) => (signals.crcErrors ?? 0) >= 10,
        },
        {
            issue: 'Memory pressure with sustained CPU load',
            severity: 'MEDIUM',
            rootCause: 'The system is under memory pressure while also consuming CPU resources, which can degrade performance.',
            recommendation: 'Review memory-consuming processes and tune buffer/cache settings to reclaim resources.',
            score: 65,
            matches: (signals) => (signals.memoryUsed ?? 0) >= 80 && signals.highCpu,
        },
    ];
    evaluate(checks) {
        const signals = this.buildSignals(checks);
        const matches = this.rules.filter((rule) => rule.matches(signals));
        if (matches.length === 0) {
            this.logger.log('No rule matched; falling back to baseline diagnosis.');
            return this.fallbackDiagnosis(signals);
        }
        const winner = matches.sort((a, b) => b.score - a.score)[0];
        return {
            issue: winner.issue,
            severity: winner.severity,
            root_cause: winner.rootCause,
            recommendation: winner.recommendation,
        };
    }
    fallbackDiagnosis(signals) {
        if (signals.highCpu) {
            return {
                issue: 'Sustained CPU pressure detected',
                severity: 'MEDIUM',
                root_cause: 'The device is experiencing a sustained CPU load without a clear correlated failure signal.',
                recommendation: 'Evaluate traffic patterns, process utilization, and scheduled tasks to identify the source of CPU demand.',
            };
        }
        if (signals.dnsSlow) {
            return {
                issue: 'Transient DNS latency observed',
                severity: 'LOW',
                root_cause: 'DNS response times exceeded expected bounds in this sample.',
                recommendation: 'Continue monitoring DNS resolution path and cache hit ratios.',
            };
        }
        return {
            issue: 'No critical anomaly detected',
            severity: 'LOW',
            root_cause: 'The available metrics do not match a known fault pattern.',
            recommendation: 'Collect additional telemetry and verify system health over time.',
        };
    }
    buildSignals(checks) {
        const cpu = this.findCheck(checks, 'cpu');
        const memory = this.findCheck(checks, 'memory');
        const iface = this.findCheck(checks, 'interface');
        const vlan = this.findCheck(checks, 'vlan');
        const dns = this.findCheck(checks, 'dns');
        const cpuLoad = this.toNumber(cpu?.metrics?.cpuLoad);
        const memoryUsed = this.toNumber(memory?.metrics?.memoryUsedPercent ?? memory?.metrics?.memoryUsed);
        const trafficUtilization = this.toNumber(iface?.metrics?.trafficUtilization ?? iface?.metrics?.trafficPercent ?? iface?.metrics?.trafficLoad);
        const crcErrors = this.toNumber(iface?.metrics?.crcErrors ?? iface?.metrics?.crcCount);
        const interfaceSpeed = this.toNumber(iface?.metrics?.interfaceSpeed);
        const expectedSpeed = this.toNumber(iface?.metrics?.expectedSpeed);
        const dnsLatency = this.toNumber(dns?.metrics?.dnsLatencyMs ?? dns?.metrics?.responseTimeMs);
        return {
            cpuLoad,
            memoryUsed,
            trafficUtilization,
            interfaceUp: this.toBoolean(iface?.metrics?.interfaceUp),
            crcErrors,
            speedMismatch: this.detectSpeedMismatch(interfaceSpeed, expectedSpeed),
            interfaceSpeed,
            expectedSpeed,
            vlanIsolation: this.toBoolean(vlan?.metrics?.isolationFailed ?? vlan?.metrics?.isolationFailure),
            dnsLatency,
            dnsSlow: dnsLatency !== null ? dnsLatency > 250 : false,
            dnsFailures: dns?.status === 'CRITICAL' || dns?.status === 'WARNING',
            highCpu: cpuLoad !== null ? cpuLoad >= 80 : false,
            highTraffic: trafficUtilization !== null ? trafficUtilization >= 70 : false,
            lowTraffic: trafficUtilization !== null ? trafficUtilization <= 30 : false,
        };
    }
    findCheck(checks, name) {
        return checks.find((check) => check.checkName.toLowerCase() === name.toLowerCase());
    }
    toNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string' && value.trim().length > 0) {
            const normalized = Number(value.replace(/[^0-9.-]/g, ''));
            return Number.isFinite(normalized) ? normalized : null;
        }
        return null;
    }
    toBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return ['true', 'yes', '1', 'up'].includes(value.toLowerCase());
        }
        if (typeof value === 'number') {
            return value > 0;
        }
        return null;
    }
    detectSpeedMismatch(interfaceSpeed, expectedSpeed) {
        if (interfaceSpeed === null || expectedSpeed === null) {
            return false;
        }
        return Math.abs(interfaceSpeed - expectedSpeed) >= Math.max(100, expectedSpeed * 0.1);
    }
};
exports.DiagnosisEngine = DiagnosisEngine;
exports.DiagnosisEngine = DiagnosisEngine = DiagnosisEngine_1 = __decorate([
    (0, common_1.Injectable)()
], DiagnosisEngine);
//# sourceMappingURL=diagnosis.engine.js.map