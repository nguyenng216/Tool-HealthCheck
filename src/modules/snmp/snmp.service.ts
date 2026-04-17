import { Injectable, Logger } from '@nestjs/common';
import { SnmpQueryDto } from './dto/snmp-query.dto';
import { SnmpQuery } from './interfaces/snmp.interface';

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

  async get(payload: SnmpQueryDto): Promise<SnmpQuery> {
    this.logger.debug(`SNMP GET: target=${payload.target}, oid=${payload.oid}`);
    return {
      target: payload.target,
      oid: payload.oid,
      type: 'get',
      results: { [payload.oid]: 'mock-value' },
      queriedAt: new Date(),
    };
  }

  async query(payload: SnmpQueryDto): Promise<SnmpQuery> {
    // Simple logic: if OID ends with a number, do GET, otherwise WALK
    const isSpecificOid = /\.\d+$/.test(payload.oid);
    return isSpecificOid ? this.get(payload) : this.walk(payload);
  }

  async getInterfaceMetrics(
    target: string,
    community: string,
    interfaceIndex: number,
  ): Promise<SnmpQuery> {
    this.logger.debug(`SNMP interface metrics: target=${target}, interface=${interfaceIndex}`);
    return {
      target,
      oid: `interfaceMetrics:${interfaceIndex}`,
      type: 'interfaceMetrics',
      results: {
        description: 'GigabitEthernet0/0/1',
        adminStatus: 'up',
        operStatus: 'up',
        inOctets: 1000000,
        outOctets: 500000,
      },
      queriedAt: new Date(),
    };
  }
}
