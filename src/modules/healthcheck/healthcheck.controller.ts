import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RunHealthcheckDto } from './dto/run-healthcheck.dto';
import { LiveConnectivityDto } from './dto/live-connectivity.dto';
import { HealthcheckService } from './healthcheck.service';

@Controller('healthchecks')
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Post()
  run(@Body() payload: RunHealthcheckDto) {
    return this.healthcheckService.run(payload);
  }

  @Post('connectivity-test')
  testConnectivity(@Body() payload: LiveConnectivityDto) {
    return this.healthcheckService.testConnectivity(payload);
  }

  @Post('live-run')
  runLive(@Body() payload: LiveConnectivityDto) {
    return this.healthcheckService.runLive(payload);
  }

  @Post('device-credential')
  saveCredential(@Body() payload: LiveConnectivityDto) {
    return this.healthcheckService.saveCredential(payload);
  }

  @Get(':deviceId')
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.healthcheckService.findByDevice(Number(deviceId));
  }
}
