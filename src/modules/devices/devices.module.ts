import { Module } from '@nestjs/common';
import { CryptoService } from '../../common/crypto/crypto.service';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, CryptoService],
  exports: [DevicesService],
})
export class DevicesModule {}
