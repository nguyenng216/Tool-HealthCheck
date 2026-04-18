import { Module } from '@nestjs/common';
import { TelnetService } from './telnet.service';

@Module({
  providers: [TelnetService],
  exports: [TelnetService],
})
export class TelnetModule {}
