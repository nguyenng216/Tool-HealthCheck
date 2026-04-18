import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { SnmpModule } from '../snmp/snmp.module';
import { SshModule } from '../ssh/ssh.module';
import { TelnetModule } from '../telnet/telnet.module';
import { CryptoService } from '../../common/crypto/crypto.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckService } from './healthcheck.service';
import { HealthcheckEngine } from './healthcheck.engine';

@Module({
  imports: [AiModule, SshModule, SnmpModule, TelnetModule],
  controllers: [HealthcheckController],
  providers: [HealthcheckService, HealthcheckEngine, CryptoService],
  exports: [HealthcheckService],
})
export class HealthcheckModule {}
