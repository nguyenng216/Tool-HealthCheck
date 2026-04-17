import { Module } from '@nestjs/common';
import { SnmpController } from './snmp.controller';
import { SnmpService } from './snmp.service';

@Module({
  controllers: [SnmpController],
  providers: [SnmpService],
  exports: [SnmpService],
})
export class SnmpModule {}
