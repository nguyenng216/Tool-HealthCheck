import { SnmpQueryDto } from './dto/snmp-query.dto';
import { SnmpQuery } from './interfaces/snmp.interface';
export declare class SnmpService {
    private readonly logger;
    get(payload: SnmpQueryDto): Promise<SnmpQuery>;
    query(payload: SnmpQueryDto): Promise<SnmpQuery>;
    walk(payload: SnmpQueryDto): Promise<SnmpQuery>;
    getInterfaceMetrics(target: string, community: string, interfaceIndex: number): Promise<SnmpQuery>;
}
