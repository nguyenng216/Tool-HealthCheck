import { SnmpQueryDto } from './dto/snmp-query.dto';
import { SnmpService } from './snmp.service';
export declare class SnmpController {
    private readonly snmpService;
    constructor(snmpService: SnmpService);
    query(payload: SnmpQueryDto): Promise<import("./interfaces/snmp.interface").SnmpQuery>;
}
