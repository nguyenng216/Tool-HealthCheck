import { Body, Controller, Post } from '@nestjs/common';
import { SnmpQueryDto } from './dto/snmp-query.dto';
import { SnmpService } from './snmp.service';

@Controller('snmp')
export class SnmpController {
  constructor(private readonly snmpService: SnmpService) {}

  @Post('query')
  query(@Body() payload: SnmpQueryDto) {
    return this.snmpService.query(payload);
  }
}
