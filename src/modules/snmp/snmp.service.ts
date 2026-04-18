import { Injectable, Logger } from '@nestjs/common';
import * as snmp from 'net-snmp';
import { SnmpQueryDto } from './dto/snmp-query.dto';
import { SnmpQuery } from './interfaces/snmp.interface';

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

  async get(payload: SnmpQueryDto): Promise<SnmpQuery> {
    this.logger.debug(`SNMP GET: target=${payload.target}, oid=${payload.oid}`);

    return new Promise((resolve, reject) => {
      const session = snmp.createSession(payload.target, payload.community || 'public', {
        version: snmp.Version2c,
        timeout: 5000,
      });

      session.get([payload.oid], (error: Error | null, varbinds: any[]) => {
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

        const results: Record<string, any> = {};
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

  async query(payload: SnmpQueryDto): Promise<SnmpQuery> {
    // Simple logic: if OID ends with a number, do GET, otherwise WALK
    const isSpecificOid = /\.\d+$/.test(payload.oid);
    return isSpecificOid ? this.get(payload) : this.walk(payload);
  }

  async walk(payload: SnmpQueryDto): Promise<SnmpQuery> {
    this.logger.debug(`SNMP WALK: target=${payload.target}, oid=${payload.oid}`);

    return new Promise((resolve, reject) => {
      const session = snmp.createSession(payload.target, payload.community || 'public', {
        version: snmp.Version2c,
        timeout: 5000,
      });

      const results: Record<string, any> = {};

      session.walk(payload.oid, 10, (varbinds: any[]) => {
        for (const varbind of varbinds) {
          if (snmp.isVarbindError(varbind)) {
            this.logger.error(`SNMP walk varbind error: ${snmp.varbindError(varbind)}`);
            continue;
          }
          results[varbind.oid] = varbind.value;
        }
      }, (error: Error | null) => {
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

  async getInterfaceMetrics(
    target: string,
    community: string,
    interfaceIndex: number,
  ): Promise<SnmpQuery> {
    this.logger.debug(`SNMP interface metrics: target=${target}, interface=${interfaceIndex}`);

    return new Promise((resolve, reject) => {
      const session = snmp.createSession(target, community, {
        version: snmp.Version2c,
        timeout: 5000,
      });

      // Standard MIB-II interface OIDs
      const oids = [
        `1.3.6.1.2.1.2.2.1.2.${interfaceIndex}`, // ifDescr
        `1.3.6.1.2.1.2.2.1.7.${interfaceIndex}`, // ifAdminStatus
        `1.3.6.1.2.1.2.2.1.8.${interfaceIndex}`, // ifOperStatus
        `1.3.6.1.2.1.2.2.1.10.${interfaceIndex}`, // ifInOctets
        `1.3.6.1.2.1.2.2.1.16.${interfaceIndex}`, // ifOutOctets
      ];

      session.get(oids, (error: Error | null, varbinds: any[]) => {
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

        const results: Record<string, any> = {};
        const oidNames = ['description', 'adminStatus', 'operStatus', 'inOctets', 'outOctets'];

        for (let i = 0; i < varbinds.length; i++) {
          const varbind = varbinds[i];
          if (snmp.isVarbindError(varbind)) {
            this.logger.error(`SNMP interface varbind error: ${snmp.varbindError(varbind)}`);
            continue;
          }

          let value = varbind.value;
          // Convert status values to readable strings
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
}
